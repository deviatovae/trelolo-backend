import { Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import { createToken } from '../service/jwt';
import { UserRepository } from '../repository/userRepository';
import { validateResult } from '../middleware/middleware';
import StatusCode from 'status-code-enum';
import { wrapError, wrapResult } from '../utils/resWrapper';
import { UserInfo } from '../types/types';
import { getUserIdByReq, hashPassword } from '../service/user';
import { UserSerializer } from '../serializer/userSerializer';
import { vt } from '../utils/translation';
import { Message } from '../types/message';

const validations = {
    email: body('email').isEmail().withMessage(vt(Message.IsEmail)).bail(),
    emailExist: body('email').custom(async (email: string, { req }) => {
        return (await UserRepository.getUserByEmail(email)) ? Promise.reject(req.t(Message.EmailInUse)) : null;
    }),
    name: body('name')
        .trim()
        .notEmpty().withMessage(vt(Message.NotEmpty)).bail()
        .isLength({ min: 2 }).withMessage(vt(Message.MinLength2, { count: 2 })),
    passwordRequirements: body('password').isLength({ min: 6 }).withMessage(vt(Message.MinLength6, { count: 6 })),
    password: body('password').notEmpty().trim().withMessage(vt(Message.NotEmpty)).bail(),
    currentPassword: body('currentPassword').trim().custom(async (currentPassword, { req }) => {
        if (!req.body.password) {
            return;
        }
        const { user } = req;
        if (!user) {
            return Promise.reject(req.t(Message.InvalidToken));
        }
        if (!currentPassword || await hashPassword(currentPassword, user.salt) !== user.password) {
            return Promise.reject(req.t(Message.IncorrectPassword));
        }
    }),
    colorHue: body('colorHue').optional().custom(async (color: unknown, { req }) => {
        if (color === null) {
            return;
        }
        if (typeof color !== 'number') {
            await Promise.reject(vt(Message.IsNumeric));
            return;
        }
        if (color < 0 || color > 360) {
            await Promise.reject(req.t(Message.IsHue));
            return;
        }
    })
};

export const getUser = async (req: Request, res: Response) => {
    const userId = getUserIdByReq(req);
    const user = await UserRepository.getUserById(userId);
    if (!user) {
        return res.status(StatusCode.ServerErrorInternal).json(wrapError(req.t(Message.UserIsNotFound)));
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
    validations.colorHue,
    validateResult,
];
export const createUser = async (req: Request, res: Response) => {
    const { email, name, password, colorHue } = req.body;
    const salt = await bcrypt.genSalt(8);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await UserRepository.createUser(email, name, passwordHash, salt, colorHue);
    const result = UserSerializer.serialize(user);

    return res.json(wrapResult<UserInfo>(result));
};

export const updateUserValidation = [
    validations.name.optional({ nullable: true }),
    validations.password.optional({ nullable: true }),
    validations.passwordRequirements.optional({ nullable: true }),
    validations.currentPassword,
    validations.colorHue,
    validateResult,
];

export const updateUser = async (req: Request, res: Response) => {
    const { name, password, colorHue } = req.body;
    const userId = getUserIdByReq(req);

    const salt = password ? await bcrypt.genSalt(8) : undefined;
    const passwordHash = password && salt ? await bcrypt.hash(password, salt) : undefined;

    const user = await UserRepository.updateUser(userId, name, passwordHash, salt, colorHue);
    const result = UserSerializer.serialize(user);

    return res.json(wrapResult<UserInfo>(result));
};

export const loginValidation = [
    validations.email.optional(false),
    validations.password.optional(false),
    validateResult,
];
export const login = async (req: Request, res: Response) => {
    const user = await UserRepository.getUserByEmail(req.body.email);
    const passwordHash = user && await hashPassword(req.body.password, user.salt);
    const isPasswordMatch = user?.password === passwordHash;

    if (!user || !isPasswordMatch) {
        return res.status(StatusCode.ClientErrorForbidden).json(wrapError(req.t(Message.EmailOrPasswordIsIncorrect)));
    }

    const userInfo = UserSerializer.serialize(user);

    return res.json(wrapResult<{ user: UserInfo, token: string }>({
        user: userInfo,
        token: createToken(user.id)
    }));
};
