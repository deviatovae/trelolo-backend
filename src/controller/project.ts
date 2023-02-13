import { body } from 'express-validator';
import { validateResult } from '../middleware/middleware';
import { Request, Response } from 'express';
import StatusCode from 'status-code-enum';
import { getUserIdByReq } from '../service/user';
import { Project } from '@prisma/client';
import { ProjectRepository } from '../repository/projectRepository';
import { wrapError, wrapListResult, wrapResult } from '../utils/resWrapper';

const getUserProjectByReq = async (req: Request): Promise<Project | null> => {
    const id = req.params.id as string;
    const userId = getUserIdByReq(req);

    return ProjectRepository.getProjectByIdAndUserId(id, userId);
};

export const getProjects = async (req: Request, res: Response) => {
    console.log(Date.now());
        const userId = getUserIdByReq(req);
        const projects = await ProjectRepository.getProjectsByUserId(userId);
    console.log(Date.now());

        return res.json(wrapListResult<Project>(projects));
    }
;

export const createProjectValidation = [
    body('name').trim().notEmpty(),
    validateResult,
];
export const createProject = async (req: Request, res: Response) => {
    const userId = getUserIdByReq(req);
    const { name }: { name: string } = req.body;
    const project = await ProjectRepository.createProject(name, userId);

    return res.json(wrapResult<Project>(project));
};

export const updateProjectValidation = [
    body('name').trim().notEmpty(),
    validateResult,
];
export const updateProject = async (req: Request, res: Response) => {
    const { name }: { name: string } = req.body;
    const project = await getUserProjectByReq(req);
    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Project is not found'));
    }

    const updatedProject = await ProjectRepository.updateProject(project.id, name);

    return res.json(wrapResult<Project>(updatedProject));
};

export const deleteProject = async (req: Request, res: Response) => {
    const project = await getUserProjectByReq(req);
    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Project is not found'));
    }

    const deletedProject = await ProjectRepository.deleteProject(project.id);

    return res.json(wrapResult<Project>(deletedProject));
};
