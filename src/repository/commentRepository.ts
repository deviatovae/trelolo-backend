import getPrismaClient from '../service/prisma';

const prisma = getPrismaClient();

export class CommentRepository {
    static async getCommentsByTaskIdAndUserId(taskId: string, userId: string) {
        return prisma.comment.findMany({
            where: {
                taskId,
                task: {
                    section: {
                        project: {
                            OR: [
                                { ownerId: userId },
                                { members: { some: { userId } } }
                            ]
                        }
                    }
                }
            },
            include: {
                user: true
            }
        });
    }

    static async isUserComment(id: string, userId: string): Promise<boolean> {
        const comment = await prisma.comment.findFirst({
            select: { id: true, userId: true },
            where: { id }
        });

        return comment?.userId === userId;
    }

    static async hasAccessToProject(commentId: string, userId: string): Promise<boolean> {
        return !!await prisma.comment.findFirst({
            select: { id: true },
            where: {
                id: commentId,
                task: {
                    section: {
                        project: {
                            OR: [
                                { ownerId: userId },
                                { members: { some: { userId } } }
                            ]
                        }
                    }
                }
            }
        });
    }

    static async createComment(taskId: string, userId: string, text: string) {
        return prisma.comment.create({
            data: {
                taskId,
                userId,
                text,
            },
            include: {
                user: true
            }
        });
    }

    static async updateComment(commentId: string, text: string) {
        return prisma.comment.update({
            where: {
                id: commentId,
            },
            data: {
                text,
                updatedAt: new Date(),
            },
            include: {
                user: true,
            }
        });
    }

    static async deleteComment(commentId: string) {
        return prisma.comment.delete({
            where: {
                id: commentId,
            },
            include: {
                user: true,
            }
        });
    }

    static async addLike(commentId: string, userId: string) {
        return prisma.commentLike.upsert({
            create: {
                commentId,
                userId,
            },
            update: {
                userId
            },
            where: {
                comment_user: {
                    commentId,
                    userId
                }
            }
        });
    }

    static async removeLike(commentId: string, userId: string) {
        return prisma.commentLike.deleteMany({
            where: {
                commentId,
                userId
            }
        });
    }

    static async getCommentsLikes(commentIds: string[]) {
        return prisma.commentLike.groupBy({
            by: ['commentId'],
            _count: {
                commentId: true
            },
            where: {
                commentId: {
                    in: commentIds
                }
            }
        });
    }

    static async getCommentLikes(commentId: string) {
        return (await prisma.commentLike.aggregate({
            _count: { commentId: true },
            where: { commentId }
        }))._count.commentId;
    }
}
