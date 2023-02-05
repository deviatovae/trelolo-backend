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

export type UpdateTaskRequestParams = {
    taskId: string
};

export type UpdateTaskRequestBody = {
    name?: string
    position?: number
    description?: string
    dueDate?: string
    isCompleted?: boolean
};
