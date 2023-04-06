import { Request, Response } from 'express';
import { getUserIdByReq } from '../service/user';
import StatusCode from 'status-code-enum';
import { wrapError, wrapListResult, wrapResult } from '../utils/resWrapper';
import { Task } from '@prisma/client';
import { TaskRepository } from '../repository/taskRepository';
import { SectionRepository } from '../repository/sectionRepository';
import { body, param, query } from 'express-validator';
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
import { vt } from '../utils/translation';
import { Message } from '../types/message';
import { ObjectId } from '../utils/objectId';

export const getAllTasksValidation = [
    query('assignee').optional().custom(async (value: string, { req }) => {
        if (!value || !Object.values<string>(TaskAssigneeTo).includes(value)) {
            await Promise.reject(req.t(Message.Incorrect));
        }
    }),
    validateResult
];

export const getAllTasks = async (req: Request, res: Response) => {
    const { assignee } = req.query;
    const tasks = await TaskRepository.getAllTasks(getUserIdByReq(req), assignee === TaskAssigneeTo.Me);
    return res.json(wrapListResult<Task>(tasks));
};

export const getTaskValidation = [
    param('sectionId').custom(ObjectId.validator),
    validateResult,
];

export const getTasks = async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const section = await SectionRepository.getSectionByIdAndUserId(sectionId, getUserIdByReq(req));

    if (!section) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.SectionIsNotFound)));
    }

    const tasks = await TaskRepository.getTasks(sectionId);
    return res.json(wrapListResult<Task>(tasks));
};

export const createTaskValidation = [
    body('name').trim().notEmpty().withMessage(vt(Message.NotEmpty)),
    param('sectionId').custom(ObjectId.validator),
    validateResult,
];

export const createTask = async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const section = await SectionRepository.getSectionByIdAndUserId(sectionId, getUserIdByReq(req));
    const name = req.body.name as string;

    if (!section) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.SectionIsNotFound)));
    }

    const position = await TaskRepository.getLastPosition(sectionId) || 0;
    const task = await TaskRepository.createTask(sectionId, name, position + 1);

    return res.json(wrapResult<TaskWithAssignees>({
        ...task,
        assignees: []
    }));
};

export const updateTaskValidation = [
    param('taskId').custom(ObjectId.validator),
    body('name').optional({ nullable: true }).trim().notEmpty().withMessage(vt(Message.NotEmpty)),
    body('position').optional({ nullable: true }).isNumeric().withMessage(vt(Message.IsNumeric)),
    body('description').optional({ nullable: true }).trim().isString().withMessage(vt(Message.IsString)),
    body('dueDate').optional().custom(async (date: unknown, { req }) => {
        if (date === null) {
            return;
        }
        if (typeof date !== 'string') {
            await Promise.reject(req.t(Message.IsDate));
            return;
        }
        const dateObj = new Date(date);
        if (dateObj.toString() === 'Invalid Date' || isNaN(dateObj.valueOf())) {
            await Promise.reject(req.t(Message.IsDate));
        }
    }).toDate(),
    body('isCompleted').optional({ nullable: true }).isBoolean().withMessage(vt(Message.IsBoolean)),
    body('assignees').optional({ nullable: true }).isArray().bail().toArray().withMessage(vt(Message.IsArray))
        .custom(async (assignees: unknown[], { req }) => {
            if (!assignees.every(assignee => typeof assignee === 'string' && !!assignee)) {
                await Promise.reject(req.t(Message.IsArrayOfNotEmptyStrings));
            }
        }),
    validateResult,
];
export const updateTask = async (req: Request<UpdateTaskRequestParams, object, UpdateTaskRequestBody>, res: Response) => {
    const { taskId } = req.params;
    const userId = getUserIdByReq(req);

    const task = await TaskRepository.getTaskByIdAndUserId(taskId, userId);
    if (!task) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.TaskIsNotFound)));
    }

    const { name, description, dueDate, isCompleted, assignees } = req.body;
    const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;

    if (assignees) {
        const members = await MemberRepository.getMembersById(assignees);
        if (members.length !== assignees.length) {
            return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.MembersWithGivenIdIsNotFound)));
        }
    }

    const updatedTask = await TaskRepository.updateTask(taskId, name, description, dueDateObj, isCompleted, assignees);

    return res.json(wrapResult<TaskWithAssignees>(updatedTask));
};

export const deleteTaskValidation = [
    param('taskId').custom(ObjectId.validator),
    validateResult,
];

export const deleteTask = async (req: Request<UpdateTaskRequestParams, object, UpdateTaskRequestBody>, res: Response) => {
    const { taskId } = req.params;
    const userId = getUserIdByReq(req);

    const task = await TaskRepository.getTaskByIdAndUserId(taskId, userId);
    if (!task) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.TaskIsNotFound)));
    }

    const deletedTask = await TaskRepository.deleteTask(taskId);

    return res.json(wrapResult<Task>(deletedTask));
};

export const assignMemberValidation = [
    param('taskId').custom(ObjectId.validator),
    body('memberId').custom(ObjectId.validator),
    validateResult,
];
export const assignMember = async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const task = await TaskRepository.getTaskByIdAndUserId(taskId, getUserIdByReq(req));
    if (!task) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.TaskIsNotFound)));
    }

    const section = await SectionRepository.getSectionByTaskId(taskId);
    const member = await MemberRepository.getMemberById(req.body.memberId);

    if (!member || !section || member.projectId !== section.projectId) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.MemberIsNotFound)));
    }

    const assignee = await TaskRepository.assignMember(taskId, member.id);
    const result = TaskAssigneeSerializer.serialize(assignee);

    return res.json(wrapResult<TaskAssigneeResult>(result));
};

export const removeAssigneeValidation = [
    param('assigneeId').custom(ObjectId.validator),
    param('taskId').custom(ObjectId.validator),
    validateResult,
];
export const removeAssignee = async (req: Request, res: Response) => {
    const { assigneeId, taskId } = req.params;

    const assignee = await TaskRepository.getAssigneeByIdAndTaskId(assigneeId, taskId);
    if (!assignee) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.AssigneeIsNotFound)));
    }

    const removedAssignee = await TaskRepository.removeAssignee(assigneeId);
    const result = TaskAssigneeSerializer.serialize(removedAssignee);
    return res.json(wrapResult<TaskAssigneeResult>(result));
};

export const moveTaskValidation = [
    param('taskId').custom(ObjectId.validator),
    param('sectionId').custom(ObjectId.validator),
    body('position').optional({ nullable: true }).isNumeric().withMessage(vt(Message.IsNumeric)),
    validateResult
];
export const moveTask = async (req: Request, res: Response) => {
    const { taskId, sectionId } = req.params;
    const { position = Number.MAX_SAFE_INTEGER } = req.body;

    if (position < 1 || position > Number.MAX_SAFE_INTEGER) {
        return res.status(StatusCode.ClientErrorBadRequest).json(wrapError(req.t(Message.PositionIsInvalid)));
    }

    const userId = getUserIdByReq(req);
    const task = await TaskRepository.getTaskByIdAndUserId(taskId, userId);
    if (!task) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.TaskIsNotFound)));
    }

    const section = await SectionRepository.getSectionByIdAndUserId(sectionId, userId);
    if (!section) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.SectionIsNotFound)));
    }

    const movedTask = await TaskRepository.moveTask(taskId, sectionId, position);
    if (!movedTask) {
        return res.status(StatusCode.ServerErrorInternal).json(wrapError(req.t(Message.MoveTaskFailed)));
    }
    return res.json(wrapResult<TaskWithAssignees>(movedTask));
};
