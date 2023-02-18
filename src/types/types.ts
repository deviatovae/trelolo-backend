import { Project } from '@prisma/client';

export type Result<D, E> = {
    result: boolean,
    data: D
    errors: E[] | null
};

export type UserInfo = {
    id: string
    email: string
    name: string
    colorHue: number | null
};

export type LoginResult = {
    user: UserInfo
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
    assignees?: string[]
};

export type BaseMemberInfo = {
    id: string
    user: UserInfo
};

export type MemberResult = BaseMemberInfo & {
    id: string
    project: Project
};

export type TaskAssigneeResult = {
    id: string
    member: BaseMemberInfo
};

export type CommentResult = {
    id: string
    text: string
    likes: number
    isLiked: boolean
    user: UserInfo
    createdAt: string
    updatedAt?: string
};
