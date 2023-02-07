import { Task2Member } from '@prisma/client';
import { TaskAssigneeResult } from '../types/types';
import { MemberSerializationData, MemberSerializer } from './memberSerializer';

export type TaskSerializationData = Task2Member & { member: MemberSerializationData };

export class TaskAssigneeSerializer {
    static serialize(assignee: TaskSerializationData): TaskAssigneeResult {
        return {
            id: assignee.id,
            member: MemberSerializer.serialize(assignee.member),
        };
    }
}
