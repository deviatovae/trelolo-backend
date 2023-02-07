import { Member, Project, User } from '@prisma/client';
import { BaseMemberInfo, MemberResult } from '../types/types';
import { UserSerializer } from './userSerializer';

export type BaseMemberSerializationData = Member & { user: User };
export type MemberSerializationData = BaseMemberSerializationData & { project: Project };

export class MemberSerializer {
    static serializeBaseInfo(member: Member & { user: User }): BaseMemberInfo {
        return {
            id: member.id,
            user: UserSerializer.serialize(member.user)
        };
    }

    static serialize(member: MemberSerializationData): MemberResult {
        return {
            ...MemberSerializer.serializeBaseInfo(member),
            project: member.project,
        };
    }
}
