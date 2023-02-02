import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { createToken } from '../service/jwt';
import { createUser, getUserByEmail } from '../repository/userRepository';

export const register = [
    body('email').isEmail(),
    body('name')
        .notEmpty().withMessage('Should not be empty').bail()
        .isLength({ min: 2 }).withMessage('Should contain at least 2 symbols'),
    body('password').isLength({ min: 6 }).withMessage('Should contain at least 6 symbols'),

    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, name, password }: { email: string; name: string, password: string } = req.body;
            const salt = await bcrypt.genSalt(8);
            const passwordHash = await bcrypt.hash(password, salt);
            await createUser(email, name, passwordHash, salt);
        } catch {
            res.status(500).json({ errors: ['Database error'] });
            return;
        }

        res.json({ result: true });
    }
];

export const authorize = [
    body('email').isEmail(),
    body('password').notEmpty(),
    async (req: Request, res: Response) => {
        const user = await getUserByEmail(req.body.email);
        const passwordHash = user && await bcrypt.hash(req.body.password, user.salt);
        const isPasswordMatch = user?.password === passwordHash;

        if (!user || !isPasswordMatch) {
            return res.status(400).json({ error: 'email/password is incorrect' });
        }

        res.json({
            result: true,
            token: createToken(user.id)
        });
    }
];
