import { body } from 'express-validator';
import { validateResult } from '../middleware/middleware';
import { Request, Response } from 'express';
import StatusCode from 'status-code-enum';
import { getUserIdByReq } from '../service/user';
import { Project } from '@prisma/client';
import { ProjectRepository } from '../repository/projectRepository';
import { wrapError, wrapListResult, wrapResult } from '../utils/resWrapper';
import { MemberRepository } from '../repository/memberRepository';
import { vt } from '../utils/translation';
import { Message } from '../types/message';

export const getProjects = async (req: Request, res: Response) => {
    const userId = getUserIdByReq(req);
    const projects = await ProjectRepository.getProjectsByUserId(userId);

    return res.json(wrapListResult<Project>(projects));
};

export const createProjectValidation = [
    body('name').trim().notEmpty().withMessage(vt(Message.NotEmpty)),
    validateResult,
];
export const createProject = async (req: Request, res: Response) => {
    const userId = getUserIdByReq(req);
    const { name }: { name: string } = req.body;
    const project = await ProjectRepository.createProject(name, userId);
    await MemberRepository.addMember(userId, project.id);

    return res.json(wrapResult<Project>(project));
};

export const updateProjectValidation = [
    body('name').trim().notEmpty().withMessage(vt(Message.NotEmpty)),
    validateResult,
];
export const updateProject = async (req: Request, res: Response) => {
    const userId = getUserIdByReq(req);
    const { name }: { name: string } = req.body;
    const id = req.params.id as string;

    const project = await ProjectRepository.getProjectByIdAndUserId(id, userId);
    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.ProjectIsNotFound)));
    }

    if (project.ownerId !== userId) {
        return res.status(StatusCode.ClientErrorUnauthorized).json(wrapError(req.t(Message.AskProjectOwnerToUpdate)));
    }

    const updatedProject = await ProjectRepository.updateProject(project.id, name);

    return res.json(wrapResult<Project>(updatedProject));
};

export const deleteProject = async (req: Request, res: Response) => {
    const userId = getUserIdByReq(req);
    const id = req.params.id as string;

    const project = await ProjectRepository.getProjectByIdAndUserId(id, userId);
    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.ProjectIsNotFound)));
    }

    if (project.ownerId !== userId) {
        return res.status(StatusCode.ClientErrorUnauthorized).json(wrapError(req.t(Message.AskProjectOwnerToDelete)));
    }

    const deletedProject = await ProjectRepository.deleteProject(project.id);

    return res.json(wrapResult<Project>(deletedProject));
};
