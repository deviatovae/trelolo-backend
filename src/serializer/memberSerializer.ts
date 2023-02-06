import { Member, Project, User } from '@prisma/client';
import { MemberResult } from '../types/types';
import { UserSerializer } from './userSerializer';

export class MemberSerializer {
    static serialize(member: Member & { project: Project, user: User }): MemberResult {
        return {
            id: member.id,
            project: member.project,
            user: UserSerializer.serialize(member.user)
        };
    }
}
