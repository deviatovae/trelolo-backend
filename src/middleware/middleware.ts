import { NextFunction, Request, Response } from 'express';
import { getUserId, isTokenValid } from '../service/jwt';
import { getUserById } from '../repository/userRepository';
import { validationResult } from 'express-validator';
import StatusCode from 'status-code-enum';

const auth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('X-TOKEN');
    if (token) {
        if (!isTokenValid(token)) {
            return null;
        }

        req.user = await getUserById(getUserId(token));
    }

    if (!token || !req.user) {
        return res.status(401).json({ error: 'User is not authorized' });
    }

    next();
};

export const validateResult = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(StatusCode.ClientErrorBadRequest).json({ errors: errors.array() });
    }

    next();
};

export default { auth };
