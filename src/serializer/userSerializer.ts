import { UserInfo } from '../types/types';
import { User } from '@prisma/client';

export class UserSerializer {
    static serialize(user: User): UserInfo {
        return {
            id: user.id,
            name: user.name,
            email: user.email
        };
    }
}
