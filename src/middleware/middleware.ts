import { NextFunction, Request, Response } from 'express';
import { getUserId, isTokenValid } from '../service/jwt';
import { getUserById } from '../repository/userRepository';

const auth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('X-TOKEN');
    if (token) {
        if (!isTokenValid(token)) {
            return null;
        }

        req.user = await getUserById(getUserId(token));
    }

    if (!token || !req.user) {
        return res.status(400).json({ error: 'User is not authorized' });
    }

    next();
};

export default { auth };
