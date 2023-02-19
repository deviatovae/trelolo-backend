import { Request, Response } from 'express';
import { getUserIdByReq } from '../service/user';
import StatusCode from 'status-code-enum';
import { wrapError, wrapListResult, wrapResult } from '../utils/resWrapper';
import { Task } from '@prisma/client';
import { TaskRepository } from '../repository/taskRepository';
import { SectionRepository } from '../repository/sectionRepository';
import { body, query } from 'express-validator';
import { validateResult } from '../middleware/middleware';
import {
    TaskAssigneeResult,
    TaskAssigneeTo,
    TaskWithAssignees,
    UpdateTaskRequestBody,
    UpdateTaskRequestParams
} from '../types/types';
import { MemberRepository } from '../repository/memberRepository';
import { TaskAssigneeSerializer } from '../serializer/taskAssigneeSerializer';

export const getAllTasksValidation = [
    query('assignee').optional().custom(async (value: string) => {
        if (!value || !Object.values<string>(TaskAssigneeTo).includes(value)) {
            await Promise.reject('Assignee param is incorrect');
        }
    }),
    validateResult
];

export const getAllTasks = async (req: Request, res: Response) => {
    const { assignee } = req.query;
    const tasks = await TaskRepository.getAllTasks(getUserIdByReq(req), assignee === TaskAssigneeTo.Me);
    return res.json(wrapListResult<Task>(tasks));
};

export const getTasks = async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const section = await SectionRepository.getSectionByIdAndUserId(sectionId, getUserIdByReq(req));

    if (!section) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Section is not found'));
    }

    const tasks = await TaskRepository.getTasks(sectionId);
    return res.json(wrapListResult<Task>(tasks));
};

export const createTaskValidation = [
    body('name').trim().notEmpty().withMessage('Name should not be empty'),
    validateResult,
];

export const createTask = async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const section = await SectionRepository.getSectionByIdAndUserId(sectionId, getUserIdByReq(req));
    const name = req.body.name as string;

    if (!section) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Section is not found'));
    }

    const position = await TaskRepository.getLastPosition(sectionId) || 0;
    const task = await TaskRepository.createTask(sectionId, name, position + 1);

    return res.json(wrapResult<TaskWithAssignees>({
        ...task,
        assignees: []
    }));
};

export const updateTaskValidation = [
    body('name').optional({ nullable: true }).trim().notEmpty().withMessage('Name should not be empty'),
    body('position').optional({ nullable: true }).isNumeric().withMessage('Position should be numeric'),
    body('description').optional({ nullable: true }).trim().isString().withMessage('Description should be of type String'),
    body('dueDate').optional().custom(async (date: unknown) => {
        if (date === null) {
            return;
        }
        if (typeof date !== 'string') {
            await Promise.reject('Due Date should be a valid date');
            return;
        }
        const dateObj = new Date(date);
        if (dateObj.toString() === 'Invalid Date' || isNaN(dateObj.valueOf())) {
            await Promise.reject('Due Date should be a valid date');
        }
    }).toDate(),
    body('isCompleted').optional({ nullable: true }).isBoolean().withMessage('isCompleted should be of type Boolean'),
    body('assignees').optional({ nullable: true }).isArray().bail().toArray().withMessage('Assignees should be type of Array')
        .custom(async (assignees: unknown[]) => {
            if (!assignees.every(assignee => typeof assignee === 'string' && !!assignee)) {
                await Promise.reject('Assignees should be array of non empty strings');
            }
        }),
    validateResult,
];
export const updateTask = async (req: Request<UpdateTaskRequestParams, object, UpdateTaskRequestBody>, res: Response) => {
    const { taskId } = req.params;
    const userId = getUserIdByReq(req);

    const task = await TaskRepository.getTaskByIdAndUserId(taskId, userId);
    if (!task) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Task is not found'));
    }

    const { name, description, dueDate, isCompleted, assignees } = req.body;
    const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const updatedTask = await TaskRepository.updateTask(taskId, name, description, dueDateObj, isCompleted, assignees);

    return res.json(wrapResult<TaskWithAssignees>(updatedTask));
};

export const deleteTask = async (req: Request<UpdateTaskRequestParams, object, UpdateTaskRequestBody>, res: Response) => {
    const { taskId } = req.params;
    const userId = getUserIdByReq(req);

    const task = await TaskRepository.getTaskByIdAndUserId(taskId, userId);
    if (!task) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Task is not found'));
    }

    const deletedTask = await TaskRepository.deleteTask(taskId);

    return res.json(wrapResult<Task>(deletedTask));
};

export const assignMember = async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const task = await TaskRepository.getTaskByIdAndUserId(taskId, getUserIdByReq(req));
    if (!task) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Task is not found'));
    }

    const section = await SectionRepository.getSectionByTaskId(taskId);
    const member = await MemberRepository.getMemberById(req.body.memberId);

    if (!member || !section || member.projectId !== section.projectId) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Member is not found'));
    }

    const assignee = await TaskRepository.assignMember(taskId, member.id);
    const result = TaskAssigneeSerializer.serialize(assignee);

    return res.json(wrapResult<TaskAssigneeResult>(result));
};

export const removeAssignee = async (req: Request, res: Response) => {
    const { assigneeId, taskId } = req.params;

    const assignee = await TaskRepository.getAssigneeByIdAndTaskId(assigneeId, taskId);
    if (!assignee) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Assignee is not found'));
    }

    const removedAssignee = await TaskRepository.removeAssignee(assigneeId);
    const result = TaskAssigneeSerializer.serialize(removedAssignee);
    return res.json(wrapResult<TaskAssigneeResult>(result));
};

export const moveTaskValidation = [
    body('position').optional({ nullable: true }).isNumeric().withMessage('Position should be numeric'),
    validateResult
];
export const moveTask = async (req: Request, res: Response) => {
    const { taskId, sectionId } = req.params;
    const { position = Number.MAX_SAFE_INTEGER } = req.body;

    if (position < 1 || position > Number.MAX_SAFE_INTEGER) {
        return res.status(StatusCode.ClientErrorBadRequest).json(wrapError('Position is invalid'));
    }

    const userId = getUserIdByReq(req);
    const task = await TaskRepository.getTaskByIdAndUserId(taskId, userId);
    if (!task) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Task is not found'));
    }

    const section = await SectionRepository.getSectionByIdAndUserId(sectionId, userId);
    if (!section) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Section is not found'));
    }

    const movedTask = await TaskRepository.moveTask(taskId, sectionId, position);
    if (!movedTask) {
        return res.status(StatusCode.ServerErrorInternal).json(wrapError('Move task failed'));
    }
    return res.json(wrapResult<TaskWithAssignees>(movedTask));
};
