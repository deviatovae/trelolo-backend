import { Task2Member } from '@prisma/client';
import { TaskAssigneeResult } from '../types/types';
import { BaseMemberSerializationData, MemberSerializer } from './memberSerializer';

export type TaskAssigneeSerializationData = Task2Member & { member: BaseMemberSerializationData };

export class TaskAssigneeSerializer {
    static serialize(assignee: TaskAssigneeSerializationData): TaskAssigneeResult {
        return {
            id: assignee.id,
            member: MemberSerializer.serializeBaseInfo(assignee.member),
        };
    }
}
