import { Project } from '@prisma/client';
import getPrismaClient from '../service/prisma';

const prisma = getPrismaClient();

export class ProjectRepository {
    static getProjectsByUserId = async (userId: string): Promise<Project[]> => {
        return prisma.project.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId } } }
                ]
            }
        });
    };

    static getProjectByIdAndUserId = async (id: string, userId: string) => {
        return prisma.project.findFirst({
            where: {
                AND: [
                    { id },
                    {
                        OR: [
                            { ownerId: userId },
                            { members: { some: { userId } } }
                        ]
                    }
                ]
            }
        });
    };

    static getProjectBySectionIdAndUserId = async (sectionId: string, userId: string) => {
        return prisma.project.findFirst({
            where: {
                AND: [
                    { sections: { some: { id: sectionId } } },
                    {
                        OR: [
                            { ownerId: userId },
                            { members: { some: { userId } } }
                        ]
                    }
                ]
            }
        });
    };

    static createProject = async (name: string, userId: string) => {
        return prisma.project.create({
            data: { name, ownerId: userId }
        });
    };

    static updateProject = async (id: string, name: string) => {
        return prisma.project.update({
            where: { id },
            data: { name }
        });
    };

    static deleteProject = async (id: string) => {
        return prisma.project.delete({
            where: { id },
        });
    };
}
