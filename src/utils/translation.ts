import { CustomValidator } from 'express-validator/src/base';
import { TOptions } from 'i18next';

export const vt = (msg: string, options?: TOptions): CustomValidator => (value, { req }) => req.t(msg, options);
