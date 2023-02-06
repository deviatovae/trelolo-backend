import { Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import { createToken } from '../service/jwt';
import { createUser, getUserByEmail } from '../repository/userRepository';
import { validateResult } from '../middleware/middleware';
import StatusCode from 'status-code-enum';
import { wrapError, wrapResult } from '../utils/resWrapper';
import { LoginResult, UserInfo } from '../types/types';

export const registerValidation = [
    body('email').isEmail().bail().custom(async (email: string) => {
        return (await getUserByEmail(email)) ? Promise.reject('E-mail already in use') : null;
    }),
    body('name')
        .notEmpty().withMessage('Should not be empty').bail()
        .isLength({ min: 2 }).withMessage('Should contain at least 2 symbols'),
    body('password').isLength({ min: 6 }).withMessage('Should contain at least 6 symbols'),
    validateResult,
];
export const register = async (req: Request, res: Response) => {
    const { email, name, password }: { email: string; name: string, password: string } = req.body;
    const salt = await bcrypt.genSalt(8);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await createUser(email, name, passwordHash, salt);
    const userResult = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    return res.json(wrapResult<UserInfo>(userResult));
};

export const loginValidation = [
    body('email').isEmail(),
    body('password').notEmpty(),
];
export const login = async (req: Request, res: Response) => {
    const user = await getUserByEmail(req.body.email);
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
