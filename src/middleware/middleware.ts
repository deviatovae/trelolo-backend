import { NextFunction, Request, Response } from 'express';
import { getUserByToken } from '../controller/user';

const auth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('X-TOKEN');
    if (token) {
        req.user = await getUserByToken(token);
    }

    if (!token || !req.user) {
        return res.status(400).json({ error: 'User is not authorized' });
    }

    next();
};

export default { auth };
