import getPrisma from '../service/prisma';

export async function getUserById(id: string) {
    return getPrisma().user.findFirst({
        where: { id }
    });
}

export async function getUserByEmail(email: string) {
    return getPrisma().user.findFirst({
        where: { email }
    });
}

export async function createUser(email: string, name: string, password: string, salt: string) {
    return getPrisma().user.create({
        data: {
            email,
            name,
            password,
            salt
        },
    });
}
