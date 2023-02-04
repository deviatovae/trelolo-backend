export type Result<D, E> = {
    result: boolean,
    data: D
    errors: E[]
};

export type GetUserResult = {
    id: string
    email: string
    name: string
};

export type LoginResult = {
    token: string
};

export type ListResult<T> = {
    items: T[]
    count: number
};
