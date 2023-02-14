import { NextFunction, Request, Response } from 'express';
import { getUserId, isTokenValid } from '../service/jwt';
import { UserRepository } from '../repository/userRepository';
import { validationResult } from 'express-validator';
import StatusCode from 'status-code-enum';
import { wrapError, wrapValidationErrors } from '../utils/resWrapper';
import { ResponseTimeFunction } from 'response-time';

const auth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('X-TOKEN');
    if (token) {
        if (!isTokenValid(token)) {
            return null;
        }

        try {
            req.user = await UserRepository.getUserById(getUserId(token));
        } catch (e) {
            console.error(e);
        }
    }

    if (!token || !req.user) {
        return res.status(StatusCode.ClientErrorUnauthorized).json(wrapError('User is not authorized'));
    }

    next();
};

export const validateResult = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(StatusCode.ClientErrorBadRequest).json(wrapValidationErrors(errors.array()));
    }

    next();
};

export const responseTimeCallback: ResponseTimeFunction = (req, res, time) => {
    const s = Math.trunc(time / 1000);
    const ms = Math.trunc(time - s * 1000);
    const executionTime = [s, ms].filter(t => !!t).join('.');

    console.log(`[${req.method || '?'}] ${req.url || '?'} - ${executionTime}ms`);
};

export default { auth };
