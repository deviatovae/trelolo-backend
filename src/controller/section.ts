import { ProjectRepository } from '../repository/projectRepository';
import { Request, Response } from 'express';
import { getUserIdByReq } from '../service/user';
import StatusCode from 'status-code-enum';
import { wrapError, wrapListResult, wrapResult } from '../utils/resWrapper';
import { SectionRepository } from '../repository/sectionRepository';
import { Section } from '@prisma/client';
import { body } from 'express-validator';
import { validateResult } from '../middleware/middleware';

export const getSections = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const project = await ProjectRepository.getProjectByIdAndUserId(projectId, getUserIdByReq(req));

    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Project is not found'));
    }

    const sections = await SectionRepository.getSections(projectId);
    return res.json(wrapListResult<Section>(sections));
};

export const createSectionValidation = [
    body('name').notEmpty().withMessage('Name should not be empty'),
    validateResult,
];
export const createSection = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const project = await ProjectRepository.getProjectByIdAndUserId(projectId, getUserIdByReq(req));
    const name = req.body.name as string;

    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Project is not found'));
    }

    const position = await SectionRepository.getLastPosition(projectId) || 0;
    const section = await SectionRepository.createSection(projectId, name, position + 1);

    return res.json(wrapResult<Section>(section));
};

export const updateSectionValidation = [
    body('name').optional().notEmpty().withMessage('Name should not be empty'),
    body('position').optional().isNumeric().withMessage('Position should be numeric'),
    validateResult,
];
export const updateSection = async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const project = await ProjectRepository.getProjectBySectionIdAndUserId(sectionId, getUserIdByReq(req));
    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Project is not found'));
    }

    const name = req.body.name as string | undefined;
    const position = req.body.position as number | undefined;
    const section = await SectionRepository.updateSection(sectionId, name, position);

    return res.json(wrapResult<Section>(section));
};

export const deleteSection = async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const project = await ProjectRepository.getProjectBySectionIdAndUserId(sectionId, getUserIdByReq(req));
    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Project is not found'));
    }

    const deletedSection = await SectionRepository.deleteSection(sectionId);

    return res.json(wrapResult<Section>(deletedSection));
};
