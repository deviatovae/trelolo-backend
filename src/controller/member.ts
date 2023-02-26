import { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateResult } from '../middleware/middleware';
import { ProjectRepository } from '../repository/projectRepository';
import { getUserIdByReq } from '../service/user';
import StatusCode from 'status-code-enum';
import { wrapError, wrapListResult, wrapResult } from '../utils/resWrapper';
import { UserRepository } from '../repository/userRepository';
import { MemberRepository } from '../repository/memberRepository';
import { MemberResult } from '../types/types';
import { MemberSerializer } from '../serializer/memberSerializer';
import { vt } from '../utils/translation';
import { Message } from '../types/message';

export const getMembers = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const project = await ProjectRepository.getProjectByIdAndUserId(projectId, getUserIdByReq(req));

    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.ProjectIsNotFound)));
    }

    const members = await MemberRepository.getMembersByProjectId(projectId);
    const result = members.map(member => MemberSerializer.serialize(member));

    return res.json(wrapListResult<MemberResult>(result));
};

export const createMemberValidation = [
    body('email').isEmail().withMessage(vt(Message.IsEmail)),
    validateResult,
];

export const addMember = async (req: Request, res: Response) => {
    const userId = getUserIdByReq(req);
    const { projectId } = req.params;
    const project = await ProjectRepository.getProjectByIdAndUserId(projectId, userId);

    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.ProjectIsNotFound)));
    }

    if (project.ownerId !== userId) {
        return res.status(StatusCode.ClientErrorUnauthorized).json(wrapError(req.t(Message.AskTheProjectOwnerToInviteThisMember)));
    }

    const user = await UserRepository.getUserByEmail(req.body.email);
    if (!user) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.UserWithThisEmailIsNotFound)));
    }


    const member = await MemberRepository.addMember(user.id, projectId);
    const result = MemberSerializer.serialize(member);

    return res.json(wrapResult<MemberResult>(result));
};

export const removeMember = async (req: Request, res: Response) => {
    const { memberId } = req.params;
    const member = await MemberRepository.getMemberById(memberId);
    const userId = getUserIdByReq(req);

    if (!member) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.MemberIsNotFound)));
    }

    const project = await ProjectRepository.getProjectByIdAndUserId(member.projectId, userId);
    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.ProjectIsNotFound)));
    }

    if (project.ownerId !== userId) {
        return res.status(StatusCode.ClientErrorUnauthorized).json(wrapError(req.t(Message.AskTheProjectOwnerToRemoveThisMember)));
    }

    if (member.userId === userId && project.ownerId === userId) {
        return res.status(StatusCode.ClientErrorBadRequest).json(wrapError(req.t(Message.CannotDeleteYourselfFromProject)));
    }

    const removedMember = await MemberRepository.removeMember(memberId);
    const result = MemberSerializer.serialize(removedMember);

    return res.json(wrapResult<MemberResult>(result));
};
