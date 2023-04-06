import { ListResult, Result } from '../types/types';
import { ValidationError } from 'express-validator';

export const wrapResult = <T>(data: T): Result<T, string> => {
    return {
        result: true,
        data,
        errors: null,
    };
};

export const wrapListResult = <T>(items: T[], count?: number): Result<ListResult<T>, string> => {
    return {
        result: true,
        data: {
            items,
            count: count || items.length
        },
        errors: null,
    };
};

export const wrapError = (error: string): Result<null, string> => {
    return {
        result: false,
        data: null,
        errors: [error],
    };
};

export const wrapValidationErrors = (errors: ValidationError[]): Result<null, ValidationError> => {
    return {
        result: false,
        data: null,
        errors,
    };
};
