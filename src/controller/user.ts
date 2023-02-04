import { Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import { createToken } from '../service/jwt';
import { createUser, getUserByEmail } from '../repository/userRepository';
import { validateResult } from '../middleware/middleware';
import StatusCode from 'status-code-enum';
import { wrapError, wrapResult } from '../utils/resWrapper';
import { GetUserResult, LoginResult } from '../types/types';

export const register = [
    body('email').isEmail().bail().custom(async (email: string) => {
        return (await getUserByEmail(email)) ? Promise.reject('E-mail already in use') : null;
    }),
    body('name')
        .notEmpty().withMessage('Should not be empty').bail()
        .isLength({ min: 2 }).withMessage('Should contain at least 2 symbols'),
    body('password').isLength({ min: 6 }).withMessage('Should contain at least 6 symbols'),
    validateResult,
    async (req: Request, res: Response) => {
        try {
            const { email, name, password }: { email: string; name: string, password: string } = req.body;
            const salt = await bcrypt.genSalt(8);
            const passwordHash = await bcrypt.hash(password, salt);
            const user = await createUser(email, name, passwordHash, salt);

            return res.json(wrapResult<GetUserResult>({
                id: user.id,
                name: user.name,
                email: user.email
            }));
        } catch {
            return res.status(StatusCode.ServerErrorInternal).json(wrapError('Database error'));
        }
    }
];

export const login = [
    body('email').isEmail(),
    body('password').notEmpty(),
    async (req: Request, res: Response) => {
        const user = await getUserByEmail(req.body.email);
        const passwordHash = user && await bcrypt.hash(req.body.password, user.salt);
        const isPasswordMatch = user?.password === passwordHash;

        if (!user || !isPasswordMatch) {
            return res.status(StatusCode.ClientErrorForbidden).json(wrapError('Email or password is incorrect'));
        }

        return res.json(wrapResult<LoginResult>({
            token: createToken(user.id)
        }));
    }
];
