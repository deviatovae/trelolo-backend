import { CustomValidator } from 'express-validator/src/base';
import { Message } from '../types/message';

export class ObjectId {
    static isValid(objectId: unknown): boolean {
        if (typeof objectId !== 'string') {
            return false;
        }
        return new RegExp('^[0-9a-fA-F]{24}$').test(objectId);
    }

    static validator: CustomValidator = async (objectId: unknown, { req }) => {
        if (ObjectId.isValid(objectId)) {
            return;
        }

        return Promise.reject(req.t(Message.IsObjectId));
    };
}
