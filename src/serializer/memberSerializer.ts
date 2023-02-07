import { Member, Project, User } from '@prisma/client';
import { MemberResult } from '../types/types';
import { UserSerializer } from './userSerializer';

export type MemberSerializationData = Member & { project: Project, user: User };
export class MemberSerializer {
    static serialize(member: MemberSerializationData): MemberResult {
        return {
            id: member.id,
            project: member.project,
            user: UserSerializer.serialize(member.user)
        };
    }
}
