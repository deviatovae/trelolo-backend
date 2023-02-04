import { body } from 'express-validator';
import { validateResult } from '../middleware/middleware';
import { Request, Response } from 'express';
import StatusCode from 'status-code-enum';
import { getUserIdByReq } from '../service/user';
import { Project } from '@prisma/client';
import { ProjectRepository } from '../repository/projectRepository';
import { wrapError, wrapResult } from '../utils/resWrapper';
import { ListResult } from '../types/types';

const getUserProjectByReq = async (req: Request): Promise<Project | null> => {
    const id = req.params.id as string;
    const userId = getUserIdByReq(req);

    return ProjectRepository.getProjectByIdAndUserId(id, userId);
};

export const getProjects = [
    async (req: Request, res: Response) => {
        const userId = getUserIdByReq(req);

        try {
            const projects = await ProjectRepository.getProjectsByUserId(userId);

            return res.json(wrapResult<ListResult<Project>>({
                items: projects,
                count: projects.length
            }));
        } catch {
            return res.status(StatusCode.ServerErrorInternal).json(wrapError('Database error'));
        }
    }
];

export const createProject = [
    body('name').notEmpty(),
    validateResult,
    async (req: Request, res: Response) => {
        const userId = getUserIdByReq(req);

        try {
            const { name }: { name: string } = req.body;
            const project = await ProjectRepository.createProject(name, userId);

            return res.json(wrapResult<Project>(project));
        } catch {
            return res.status(StatusCode.ServerErrorInternal).json(wrapError('Database error'));
        }
    }
];

export const updateProject = [
    body('name').notEmpty(),
    validateResult,
    async (req: Request, res: Response) => {
        try {
            const { name }: { name: string } = req.body;
            const project = await getUserProjectByReq(req);
            if (!project) {
                return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Project is not found'));
            }

            const updatedProject = await ProjectRepository.updateProject(project.id, name);

            return res.json(wrapResult<Project>(updatedProject));
        } catch {
            return res.status(StatusCode.ServerErrorInternal).json(wrapError('Database error'));
        }
    }
];

export const deleteProject = [
    async (req: Request, res: Response) => {
        try {
            const project = await getUserProjectByReq(req);
            if (!project) {
                return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Project is not found'));
            }

            const deletedProject = await ProjectRepository.deleteProject(project.id);

            return res.json(wrapResult<Project>(deletedProject));
        } catch {
            return res.status(StatusCode.ServerErrorInternal).json(wrapError('Database error'));
        }
    }
];
