import { NextFunction, Request, RequestHandler, Response } from 'express';
import StatusCode from 'status-code-enum';
import { wrapError } from './resWrapper';

export const wrapHandler = <Param, Body, Query>(callback: RequestHandler<Param, Body, Query>): RequestHandler<Param, Body, Query> => {
    return async (req: Request<Param, Body, Query>, res: Response, next: NextFunction) => {
        try {
            await callback(req, res, next);
        } catch (e) {
            console.error(e);
            res.status(StatusCode.ServerErrorInternal).json(wrapError('Internal error'));
        }
    };
};
