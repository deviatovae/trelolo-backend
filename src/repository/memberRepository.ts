import getPrismaClient from '../service/prisma';

const prisma = getPrismaClient();

export class MemberRepository {
    static getMemberById(id: string) {
        return prisma.member.findFirst({
            where: {
                id,
            }
        });
    }

    static getMembersByProjectId(projectId: string) {
        return prisma.member.findMany({
            where: {
                projectId
            },
            include: {
                project: true,
                user: true
            }
        });
    }

    static addMember = (userId: string, projectId: string) => {
        return prisma.member.upsert({
            create: {
                userId,
                projectId
            },
            update: {
                userId,
                projectId
            },
            where: {
                user_project: {
                    userId,
                    projectId
                }
            },
            include: {
                project: true,
                user: true,
            }
        });
    };

    static removeMember = (id: string) => {
        return prisma.member.delete({
            where: { id },
            include: {
                project: true,
                user: true,
            }
        });
    };
}

