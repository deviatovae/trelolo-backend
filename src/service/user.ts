import { Request } from 'express';

export const getUserIdByReq = (req: Request): string => {
    const { user } = req;
    if (!user) {
        throw Error('User is not authorized');
    }
    return user.id;
};
