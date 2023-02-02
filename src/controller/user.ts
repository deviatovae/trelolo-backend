import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();
const TOKEN_KEY = '15047601-154a-441f-a75a-7d2e64a99a27';

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

        const { email, name, password }: { email: string; name: string, password: string } = req.body;
        try {
            const salt = await bcrypt.genSalt(8);
            const passwordHash = await bcrypt.hash(password, salt);

            await prisma.user.create({
                data: {
                    email,
                    name,
                    password: passwordHash,
                    salt
                },
            });
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
        const user = await prisma.user.findFirst({
            where: {
                email: { equals: req.body.email }
            }
        });

        const passwordHash = user && await bcrypt.hash(req.body.password, user.salt);
        const isPasswordMatch = user?.password === passwordHash;

        if (!user || !isPasswordMatch) {
            return res.status(400).json({ error: 'email/password is incorrect' });
        }

        const tokenHead = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'jwt' })).toString('base64');
        const tokenBody = Buffer.from(JSON.stringify({ id: user.id, iot: Date.now() })).toString('base64');

        const signature = crypto
            .createHmac('SHA256', TOKEN_KEY)
            .update(`${tokenHead}.${tokenBody}`)
            .digest('base64');

        res.json({
            result: true,
            token: `${tokenHead}.${tokenBody}.${signature}`
        });
    }
];

export const getUserByToken = async (token: string) => {
    const [tokenHead, tokenBody, tokenSignature] = token.split('.');

    const signature = crypto
        .createHmac('SHA256', TOKEN_KEY)
        .update(`${tokenHead}.${tokenBody}`)
        .digest('base64');

    if (signature !== tokenSignature) {
        return null;
    }

    const { id }: { id: string, iot: number } = JSON.parse(Buffer.from(tokenBody, 'base64').toString('utf8'));

    return prisma.user.findFirst({ where: { id } });
};
