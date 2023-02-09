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

export const getMembers = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const project = await ProjectRepository.getProjectByIdAndUserId(projectId, getUserIdByReq(req));

    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Project is not found'));
    }

    const members = await MemberRepository.getMembersByProjectId(projectId);
    const result = members.map(member => MemberSerializer.serialize(member));

    return res.json(wrapListResult<MemberResult>(result));
};

export const createMemberValidation = [
    body('email').isEmail().withMessage('Email should be valid'),
    validateResult,
];

export const addMember = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const project = await ProjectRepository.getProjectByIdAndUserId(projectId, getUserIdByReq(req));

    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Project is not found'));
    }

    const user = await UserRepository.getUserByEmail(req.body.email);
    if (!user) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('User with this email is not found'));
    }

    const member = await MemberRepository.addMember(user.id, projectId);
    const result = MemberSerializer.serialize(member);

    return res.json(wrapResult<MemberResult>(result));
};

export const removeMember = async (req: Request, res: Response) => {
    const { memberId } = req.params;
    const member = await MemberRepository.getMemberById(memberId);
    if (!member) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Member is not found'));
    }

    const project = await ProjectRepository.getProjectByIdAndUserId(member.projectId, getUserIdByReq(req));
    if (!project) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Project is not found'));
    }

    const removedMember = await MemberRepository.removeMember(memberId);
    const result = MemberSerializer.serialize(removedMember);

    return res.json(wrapResult<MemberResult>(result));
};
