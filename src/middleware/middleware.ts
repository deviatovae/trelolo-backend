import { NextFunction, Request, Response } from 'express';
import { getUserId, isTokenValid } from '../service/jwt';
import { UserRepository } from '../repository/userRepository';
import { validationResult } from 'express-validator';
import StatusCode from 'status-code-enum';
import { wrapError, wrapValidationErrors } from '../utils/resWrapper';
import { ResponseTimeFunction } from 'response-time';
import { Message } from '../types/message';

const auth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('X-TOKEN');
    if (token) {
        if (!isTokenValid(token)) {
            return res.status(StatusCode.ClientErrorUnauthorized).json(wrapError(req.t(Message.InvalidToken)));
        }

        try {
            req.user = await UserRepository.getUserById(getUserId(token));
        } catch (e) {
            return res.status(StatusCode.ServerErrorInternal).json(wrapError(req.t(Message.InternalError)));
        }
    }

    if (!token || !req.user) {
        return res.status(StatusCode.ClientErrorUnauthorized).json(wrapError(req.t(Message.TokenHeaderIsRequired)));
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

    console.log(`[${req.method || '?'}] ${req.url || '?'} - ${executionTime}${s ? 's' : 'ms'}`);
};

export default { auth };
