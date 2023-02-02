import { PrismaClient } from '@prisma/client';

let client: PrismaClient;
export default function getPrismaClient(): PrismaClient {
    if (!client) {
        client = new PrismaClient();
    }
    return client;
}
