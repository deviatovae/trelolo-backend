import getPrismaClient from '../service/prisma';

const prisma = getPrismaClient();

export class TaskRepository {
    static async getTasks(sectionId: string) {
        return prisma.task.findMany({
            where: {
                section: {
                    id: sectionId
                }
            },
            include: {
                assignees: true
            },
            orderBy: {
                position: 'asc'
            }
        });
    }

    static async getLastPosition(sectionId: string) {
        return prisma.task.aggregate({
            _max: {
                position: true
            },

            where: {
                section: {
                    id: sectionId
                }
            }
        }).then(agg => agg._max.position);
    }

    static createTask = async (sectionId: string, name: string, position: number) => {
        return prisma.task.create({
            data: {
                sectionId,
                name,
                position,
            }
        });
    };

    static moveTask = async (id: string, sectionId: string, position: number) => {
        return prisma.$transaction(async (tx) => {
            const task = await tx.task.findFirst({ where: { id } });
            if (!task) {
                return;
            }

            const lastPosition = await tx.task.aggregate({
                _max: { position: true },
                where: { section: { id: sectionId } }
            }).then(agg => agg._max.position);

            const { position: curPosition, sectionId: curSectionId } = task;
            const isSameSection = curSectionId === sectionId;
            const toPosition = lastPosition && position > lastPosition ? (isSameSection ? lastPosition : lastPosition + 1) : position;

            console.log(lastPosition, toPosition);

            const isMoveDown = (toPosition - curPosition) > 0;
            const isSamePosition = curPosition === toPosition;

            if (isSameSection && isSamePosition) {
                return task;
            }

            if (isSameSection) {
                if (isMoveDown) {
                    await tx.task.updateMany({
                        data: { position: { decrement: 1 } },
                        where: { position: { gt: curPosition, lte: toPosition }, sectionId: curSectionId }
                    });
                } else {

                    await tx.task.updateMany({
                        data: { position: { increment: 1 } },
                        where: { position: { gte: toPosition, lt: curPosition }, sectionId: curSectionId }
                    });
                }
            } else {
                await tx.task.updateMany({
                    data: { position: { decrement: 1 } },
                    where: { position: { gt: curPosition }, sectionId: curSectionId }
                });
                await tx.task.updateMany({
                    data: { position: { increment: 1 } },
                    where: { position: { gte: toPosition }, sectionId }
                });
            }

            return tx.task.update({ data: { position: toPosition, sectionId }, where: { id } });
        });
    };

    static updateTask = async (id: string, name?: string, description?: string, dueDate?: Date, isCompleted?: boolean, assignees?: string[]) => {
        await prisma.$transaction([
            ...(assignees ? [prisma.task2Member.deleteMany({ where: { taskId: id } })] : []),
            ...(assignees?.length ? [prisma.task2Member.createMany({
                data: assignees.map(memberId => ({ taskId: id, memberId }))
            })] : []),
        ]);

        return prisma.task.update({
            where: {
                id
            },
            data: {
                name,
                description,
                dueDate,
                isCompleted,
            },
            include: {
                assignees: true
            }
        });
    };

    static async getTaskByIdAndUserId(taskId: string, userId: string) {
        return prisma.task.findFirst({
            where: {
                id: taskId,
                section: {
                    project: {
                        OR: [
                            { ownerId: userId },
                            { members: { some: { userId } } }
                        ]
                    }
                }
            }
        });
    }

    static async deleteTask(id: string) {
        return prisma.task.delete({
            where: { id }
        });
    }

    static async assignMember(taskId: string, memberId: string) {
        return prisma.task2Member.upsert({
            create: {
                taskId,
                memberId
            },
            update: {
                taskId,
                memberId
            },
            where: {
                task_member: {
                    taskId,
                    memberId
                }
            },
            include: {
                member: {
                    include: {
                        user: true,
                    }
                }
            }
        });
    }

    static async removeAssignee(assigneeId: string) {
        return prisma.task2Member.delete({
            where: { id: assigneeId },
            include: {
                member: {
                    include: {
                        user: true,
                    }
                }
            }
        });
    }

    static async getAssigneeByIdAndTaskId(assigneeId: string, taskId: string) {
        return prisma.task2Member.findFirst({
            where: {
                id: assigneeId,
                taskId
            }
        });
    }

    static async getAllTasks(userId: string, isAssignedToUser = false) {
        return prisma.task.findMany({
            where: {
                assignees: {
                    ...(isAssignedToUser ? { some: { member: { userId } } } : {})
                },
                section: {
                    project: {
                        OR: [
                            { ownerId: userId },
                            { members: { some: { userId } } }
                        ]
                    }
                }
            },
            include: {
                assignees: true,
                section: {
                    include: {
                        project: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });
    }
}
