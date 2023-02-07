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
}
