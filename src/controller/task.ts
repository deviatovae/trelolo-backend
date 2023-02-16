import { Request, Response } from 'express';
import { getUserIdByReq } from '../service/user';
import StatusCode from 'status-code-enum';
import { wrapError, wrapListResult, wrapResult } from '../utils/resWrapper';
import { Task } from '@prisma/client';
import { TaskRepository } from '../repository/taskRepository';
import { SectionRepository } from '../repository/sectionRepository';
import { body } from 'express-validator';
import { validateResult } from '../middleware/middleware';
import { TaskAssigneeResult, UpdateTaskRequestBody, UpdateTaskRequestParams } from '../types/types';
import { MemberRepository } from '../repository/memberRepository';
import { TaskAssigneeSerializer } from '../serializer/taskAssigneeSerializer';

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

    return res.json(wrapResult<Task>(task));
};

export const updateTaskValidation = [
    body('name').optional().trim().notEmpty().withMessage('Name should not be empty'),
    body('position').optional().isNumeric().withMessage('Position should be numeric'),
    body('description').optional().trim().isString().withMessage('Description should be of type String'),
    body('dueDate').optional().isString().custom(async (date: string) => {
        const dateObj = new Date(date);
        if (dateObj.toString() === 'Invalid Date' || isNaN(dateObj.valueOf())) {
            await Promise.reject('Due Date should be a valid date');
        }
    }).toDate(),
    body('isCompleted').optional().isBoolean().withMessage('isCompleted should be of type Boolean'),
    validateResult,
];
export const updateTask = async (req: Request<UpdateTaskRequestParams, object, UpdateTaskRequestBody>, res: Response) => {
    const { taskId } = req.params;
    const userId = getUserIdByReq(req);

    const task = await TaskRepository.getTaskByIdAndUserId(taskId, userId);
    if (!task) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Task is not found'));
    }

    const { name, description, dueDate, isCompleted } = req.body;
    const dueDateObj = dueDate ? new Date(dueDate) : undefined;
    const updatedTask = await TaskRepository.updateTask(taskId, name, description, dueDateObj, isCompleted);

    return res.json(wrapResult<Task>(updatedTask));
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
    body('position')
        .notEmpty().withMessage('Position should not be empty').bail()
        .isNumeric().withMessage('Position should be numeric'),
    validateResult
];
export const moveTask = async (req: Request, res: Response) => {
    const { taskId, sectionId } = req.params;
    const { position } = req.body;

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
    return res.json(wrapResult<Task>(movedTask));
};
