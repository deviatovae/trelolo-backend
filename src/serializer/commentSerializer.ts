import { Comment, User } from '@prisma/client';
import { CommentResult } from '../types/types';
import { UserSerializer } from './userSerializer';

export class CommentSerializer {
    static serialize(comment: Comment & { user: User }, likes: number, isLiked: boolean): CommentResult {
        return {
            id: comment.id,
            text: comment.text,
            user: UserSerializer.serialize(comment.user),
            likes,
            isLiked,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt?.toISOString(),
        };
    }
}
