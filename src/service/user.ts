import { Request } from 'express';
import bcrypt from 'bcrypt';

export const getUserIdByReq = (req: Request): string => {
    const { user } = req;
    if (!user) {
        throw Error('User is not authorized');
    }
    return user.id;
};

export const hashPassword = async (password: string, salt: string): Promise<string> => {
    return bcrypt.hash(password, salt);
};
