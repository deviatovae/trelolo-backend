import { Request, Response } from 'express';
import { CommentRepository } from '../repository/commentRepository';
import { getUserIdByReq } from '../service/user';
import { CommentSerializer } from '../serializer/commentSerializer';
import { wrapError, wrapListResult, wrapResult } from '../utils/resWrapper';
import { CommentResult } from '../types/types';
import { TaskRepository } from '../repository/taskRepository';
import StatusCode from 'status-code-enum';
import { body, param } from 'express-validator';
import { validateResult } from '../middleware/middleware';
import { vt } from '../utils/translation';
import { Message } from '../types/message';
import { ObjectId } from '../utils/objectId';

export const getCommentsValidation = [
    param('taskId').custom(ObjectId.validator),
    validateResult,
];

export const getComments = async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const userId = getUserIdByReq(req);

    const comments = await CommentRepository.getCommentsByTaskIdAndUserId(taskId, userId);
    const commentIds = comments.map(comment => comment.id);
    const commentsLikes = await CommentRepository.getCommentsLikes(commentIds);
    const likedComments = await CommentRepository.getLikedCommentsByUserId(commentIds, userId);

    const likesByCommentId = commentsLikes.reduce((acc, item) => acc.set(item.commentId, item._count.commentId), new Map<string, number>());
    const result = comments.map(comment => {
        const likes = likesByCommentId.get(comment.id) || 0;
        const isLiked = likedComments.includes(comment.id);
        return CommentSerializer.serialize(comment, likes, isLiked);
    });

    return res.json(wrapListResult<CommentResult>(result));
};

export const addCommentValidation = [
    param('taskId').custom(ObjectId.validator),
    body('text').trim().notEmpty({ ignore_whitespace: true }).withMessage(vt(Message.NotEmpty)),
    validateResult,
];

export const addComment = async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const { text } = req.body;
    const userId = getUserIdByReq(req);

    const task = await TaskRepository.getTaskByIdAndUserId(taskId, userId);
    if (!task) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.TaskIsNotFound)));
    }

    const comment = await CommentRepository.createComment(taskId, userId, text);
    const result = CommentSerializer.serialize(comment, 0, false);

    return res.json(wrapResult<CommentResult>(result));
};

export const updateCommentValidation = [
    param('commentId').custom(ObjectId.validator),
    body('text').trim().notEmpty({ ignore_whitespace: true }).withMessage(vt(Message.NotEmpty)),
    validateResult,
];

export const updateComment = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = getUserIdByReq(req);

    if (!await CommentRepository.isUserComment(commentId, userId)) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.CommentIsNotFound)));
    }

    const comment = await CommentRepository.updateComment(commentId, text);
    const likes = await CommentRepository.getCommentLikes(commentId);
    const liked = await CommentRepository.getLikedCommentsByUserId([commentId], userId);
    const result = CommentSerializer.serialize(comment, likes, liked.includes(commentId));

    return res.json(wrapResult<CommentResult>(result));
};

export const deleteCommentValidation = [
    param('commentId').custom(ObjectId.validator),
    validateResult,
];
export const deleteComment = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const userId = getUserIdByReq(req);

    if (!await CommentRepository.isUserComment(commentId, userId)) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.CommentIsNotFound)));
    }

    const comment = await CommentRepository.deleteComment(commentId);
    const likes = await CommentRepository.getCommentLikes(commentId);
    const liked = await CommentRepository.getLikedCommentsByUserId([commentId], userId);
    const result = CommentSerializer.serialize(comment, likes, liked.includes(commentId));

    return res.json(wrapResult<CommentResult>(result));
};

export const addCommentLikeValidation = [
    param('commentId').custom(ObjectId.validator),
    validateResult,
];

export const addCommentLike = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const userId = getUserIdByReq(req);

    if (!await CommentRepository.hasAccessToProject(commentId, userId)) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.CommentIsNotFound)));
    }

    const commentLike = await CommentRepository.addLike(commentId, userId);
    const likeCounts = await CommentRepository.getCommentLikes(commentId);

    return res.json(wrapResult({
        id: commentLike.commentId,
        likes: likeCounts,
        isLiked: true,
    }));
};

export const deleteCommentLikeValidation = [
    param('commentId').custom(ObjectId.validator),
    validateResult,
];
export const deleteCommentLike = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const userId = getUserIdByReq(req);

    if (!await CommentRepository.hasAccessToProject(commentId, userId)) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.CommentIsNotFound)));
    }

    const commentLike = await CommentRepository.getCommentLikes(commentId);
    if (!commentLike) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError(req.t(Message.CommentLikeIsNotFound)));
    }

    await CommentRepository.removeLike(commentId, userId);
    const likeCounts = await CommentRepository.getCommentLikes(commentId);

    return res.json(wrapResult({
        id: commentId,
        likes: likeCounts,
        isLiked: false,
    }));
};
