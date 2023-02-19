import getPrismaClient from '../service/prisma';

const prisma = getPrismaClient();

export class SectionRepository {
    static async getSections(projectId: string) {
        return prisma.section.findMany({
            where: {
                project: {
                    id: projectId
                }
            },
            orderBy: {
                position: 'asc'
            }
        });
    }

    static async createSection(projectId: string, name: string, position: number) {
        return prisma.section.create({
            data: {
                name,
                projectId,
                position,
            }
        });
    }

    static async getLastPosition(projectId: string) {
        return prisma.section.aggregate({
            _max: {
                position: true
            },

            where: {
                project: {
                    id: projectId
                }
            }
        }).then(agg => agg._max.position);
    }

    static async updateSection(id: string, name?: string, position?: number) {
        return prisma.section.update({
            where: {
                id,
            },
            data: {
                name,
                position
            }
        });
    }

    static async deleteSection(id: string) {
        return prisma.section.delete({
            where: { id }
        });
    }

    static async getSectionByIdAndUserId(sectionId: string, userId: string) {
        return prisma.section.findFirst({
            where: {
                id: sectionId,
                project: {
                    OR: [
                        { ownerId: userId },
                        { members: { some: { userId } } }
                    ]
                }
            }
        });
    }

    static async getSectionByTaskId(taskId: string) {
        return prisma.section.findFirst({
            where: {
                tasks: {
                    some: {
                        id: taskId
                    }
                }
            }
        });
    }

    static moveSection = async (id: string, position: number) => {
        return prisma.$transaction(async (tx) => {
            const section = await tx.section.findFirst({ where: { id } });
            if (!section) {
                return;
            }

            const lastPosition = await tx.section.aggregate({
                _max: { position: true },
                where: { projectId: section.projectId }
            }).then(agg => agg._max.position) || 0;

            console.log('pos', position);
            console.log('last', lastPosition);

            const { position: curPosition } = section;
            console.log('curPos', curPosition);
            const toPosition = position > lastPosition ? lastPosition : position;
            console.log('toPos', toPosition);
            const isMoveDown = (toPosition - curPosition) > 0;
            console.log('isMoveDown', isMoveDown);
            const isSamePosition = curPosition === toPosition;
            console.log('isSame', isSamePosition);

            if (isSamePosition) {
                return section;
            }

            if (isMoveDown) {
                await tx.section.updateMany({
                    data: { position: { decrement: 1 } },
                    where: {
                        position: { gt: curPosition, lte: toPosition },
                        id: { not: id },
                        projectId: section.projectId
                    }
                });
            } else {
                await tx.section.updateMany({
                    data: { position: { increment: 1 } },
                    where: {
                        position: { gte: toPosition, lt: curPosition },
                        id: { not: id },
                        projectId: section.projectId
                    }
                });
            }

            return tx.section.update({
                data: { position: toPosition },
                where: { id },
            });
        });
    };
}
