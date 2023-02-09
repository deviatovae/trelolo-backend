import getPrismaClient from '../service/prisma';

const prisma = getPrismaClient();

export class UserRepository {
    static async getUserById(id: string) {
        return prisma.user.findFirst({
            where: { id }
        });
    }

    static async getUserByEmail(email: string) {
        return prisma.user.findFirst({
            where: { email }
        });
    }

    static async createUser(email: string, name: string, password: string, salt: string) {
        return prisma.user.create({
            data: {
                email,
                name,
                password,
                salt
            },
        });
    }

    static async updateUser(id: string, name?: string, password?: string, salt?: string) {
        return prisma.user.update({
            where: {
                id
            },
            data: {
                name,
                password,
                salt
            },
        });
    }
}
