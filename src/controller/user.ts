import { Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import { createToken } from '../service/jwt';
import { UserRepository } from '../repository/userRepository';
import { validateResult } from '../middleware/middleware';
import StatusCode from 'status-code-enum';
import { wrapError, wrapResult } from '../utils/resWrapper';
import { LoginResult, UserInfo } from '../types/types';
import { getUserIdByReq } from '../service/user';
import { UserSerializer } from '../serializer/userSerializer';

const validations = {
    email: body('email').isEmail().withMessage('Should be a valid email').bail(),
    emailExist: body('email').custom(async (email: string) => {
        return (await UserRepository.getUserByEmail(email)) ? Promise.reject('E-mail already in use') : null;
    }),
    name: body('name')
        .trim()
        .notEmpty().withMessage('Should not be empty').bail()
        .isLength({ min: 2 }).withMessage('Should contain at least 2 symbols'),
    password: body('password').trim().notEmpty().withMessage('Password should not be empty'),
    passwordRequirements: body('password').isLength({ min: 8 }).withMessage('Should contain at least 6 symbols'),
};

export const getUser = async (req: Request, res: Response) => {
    const userId = getUserIdByReq(req);
    const user = await UserRepository.getUserById(userId);
    if (!user) {
        return res.status(StatusCode.ServerErrorInternal).json(wrapError('User is not found'));
    }
    const result = UserSerializer.serialize(user);

    return res.json(wrapResult<UserInfo>(result));
};

export const createUserValidation = [
    validations.email,
    validations.emailExist,
    validations.name,
    validations.password,
    validations.passwordRequirements,
    validateResult,
];
export const createUser = async (req: Request, res: Response) => {
    const { email, name, password }: { email: string; name: string, password: string } = req.body;
    const salt = await bcrypt.genSalt(8);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await UserRepository.createUser(email, name, passwordHash, salt);
    const result = UserSerializer.serialize(user);

    return res.json(wrapResult<UserInfo>(result));
};

export const updateUserValidation = [
    validations.name.optional(),
    validations.password.optional(),
    validations.passwordRequirements.optional(),
    validateResult,
];

export const updateUser = async (req: Request, res: Response) => {
    const { name, password }: { name?: string, password?: string } = req.body;
    const salt = password ? await bcrypt.genSalt(8) : undefined;
    const passwordHash = password && salt ? await bcrypt.hash(password, salt) : undefined;
    const userId = getUserIdByReq(req);

    const user = await UserRepository.updateUser(userId, name, passwordHash, salt);
    const result = UserSerializer.serialize(user);

    return res.json(wrapResult<UserInfo>(result));
};

export const loginValidation = [
    validations.email,
    validations.password,
];
export const login = async (req: Request, res: Response) => {
    const user = await UserRepository.getUserByEmail(req.body.email);
    const passwordHash = user && await bcrypt.hash(req.body.password, user.salt);
    const isPasswordMatch = user?.password === passwordHash;

    if (!user || !isPasswordMatch) {
        return res.status(StatusCode.ClientErrorForbidden).json(wrapError('Email or password is incorrect'));
    }

    return res.json(wrapResult<LoginResult>({
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
        token: createToken(user.id)
    }));
};
