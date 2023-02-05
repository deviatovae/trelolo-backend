import getPrismaClient from '../service/prisma';

const prisma = getPrismaClient();

export class TaskRepository {
    static async getTasks(sectionId: string) {
        return prisma.task.findMany({
            where: {
                section: {
                    id: sectionId
                }
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

    static updateTask = async (id: string, name?: string, position?: number, description?: string, dueDate?: Date, isCompleted?: boolean) => {
        return prisma.task.update({
            where: {
                id
            },
            data: {
                name,
                position,
                description,
                dueDate,
                isCompleted,
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
}
