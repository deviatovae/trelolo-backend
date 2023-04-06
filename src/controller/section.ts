import { ProjectRepository } from '../repository/projectRepository';
import { Request, Response } from 'express';
import { getUserIdByReq } from '../service/user';
import StatusCode from 'status-code-enum';
import { wrapError, wrapListResult, wrapResult } from '../utils/resWrapper';
import { SectionRepository } from '../repository/sectionRepository';
import { Section } from '@prisma/client';
import { body, param } from 'express-validator';
import { validateResult } from '../middleware/middleware';
import { vt } from '../utils/translation';
import { Message } from '../types/message';
import { ObjectId } from '../utils/objectId';

export const getSectionValidation = [
    param('projectId').custom(ObjectId.validator),
    validateResult,
];

export const getSections = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const project = await ProjectRepository.getProjectByIdAndUserId(projectId, getUserIdByReq(req));

    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.ProjectIsNotFound)));
    }

    const sections = await SectionRepository.getSections(projectId);
    return res.json(wrapListResult<Section>(sections));
};

export const createSectionValidation = [
    body('name').trim().notEmpty().withMessage(vt(Message.NotEmpty)),
    param('projectId').custom(ObjectId.validator),
    validateResult,
];
export const createSection = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const project = await ProjectRepository.getProjectByIdAndUserId(projectId, getUserIdByReq(req));
    const name = req.body.name as string;

    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.ProjectIsNotFound)));
    }

    const position = await SectionRepository.getLastPosition(projectId) || 0;
    const section = await SectionRepository.createSection(projectId, name, position + 1);

    return res.json(wrapResult<Section>(section));
};

export const updateSectionValidation = [
    body('name').optional({ nullable: true }).trim().notEmpty().withMessage(vt(Message.NotEmpty)),
    body('position').optional({ nullable: true }).isNumeric().withMessage(vt(Message.IsNumeric)),
    param('sectionId').custom(ObjectId.validator),
    validateResult,
];
export const updateSection = async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const project = await ProjectRepository.getProjectBySectionIdAndUserId(sectionId, getUserIdByReq(req));
    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.ProjectIsNotFound)));
    }

    const name = req.body.name as string | undefined;
    const position = req.body.position as number | undefined;
    const section = await SectionRepository.updateSection(sectionId, name, position);

    return res.json(wrapResult<Section>(section));
};

export const deleteSectionValidation = [
    param('sectionId').custom(ObjectId.validator),
    validateResult,
];
export const deleteSection = async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const project = await ProjectRepository.getProjectBySectionIdAndUserId(sectionId, getUserIdByReq(req));
    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.ProjectIsNotFound)));
    }

    const deletedSection = await SectionRepository.deleteSection(sectionId);

    return res.json(wrapResult<Section>(deletedSection));
};

export const moveSectionValidation = [
    param('sectionId').custom(ObjectId.validator),
    body('position').optional({ nullable: true }).isNumeric().withMessage(vt(Message.IsNumeric)),
    validateResult
];
export const moveSection = async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const { position = Number.MAX_SAFE_INTEGER } = req.body;

    if (position < 1 || position > Number.MAX_SAFE_INTEGER) {
        return res.status(StatusCode.ClientErrorBadRequest).json(wrapError(req.t(Message.PositionIsInvalid)));
    }

    const userId = getUserIdByReq(req);
    const section = await SectionRepository.getSectionByIdAndUserId(sectionId, userId);
    if (!section) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.SectionIsNotFound)));
    }

    const movedSection = await SectionRepository.moveSection(sectionId, position);
    if (!movedSection) {
        return res.status(StatusCode.ServerErrorInternal).json(wrapError(req.t(Message.MoveSectionFailed)));
    }
    return res.json(wrapResult<Section>(movedSection));
};
