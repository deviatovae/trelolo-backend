import { Request, Response } from 'express';
import { CommentRepository } from '../repository/commentRepository';
import { getUserIdByReq } from '../service/user';
import { CommentSerializer } from '../serializer/commentSerializer';
import { wrapError, wrapListResult, wrapResult } from '../utils/resWrapper';
import { CommentResult } from '../types/types';
import { TaskRepository } from '../repository/taskRepository';
import StatusCode from 'status-code-enum';
import { body } from 'express-validator';
import { validateResult } from '../middleware/middleware';

export const getComments = async (req: Request, res: Response) => {
    const { taskId } = req.params;

    const comments = await CommentRepository.getCommentsByTaskIdAndUserId(taskId, getUserIdByReq(req));
    const commentIds = comments.map(comment => comment.id);
    const commentsLikes = await CommentRepository.getCommentsLikes(commentIds);
    const likesByCommentId = commentsLikes.reduce((acc, item) => acc.set(item.commentId, item._count.commentId), new Map<string, number>());
    const result = comments.map(comment => CommentSerializer.serialize(comment, likesByCommentId.get(comment.id) || 0));

    return res.json(wrapListResult<CommentResult>(result));
};

export const commentValidation = [
    body('text').notEmpty({ ignore_whitespace: true }).withMessage('Comment text should not be empty').trim(),
    validateResult,
];

export const addComment = async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const { text } = req.body;
    const userId = getUserIdByReq(req);

    const task = await TaskRepository.getTaskByIdAndUserId(taskId, userId);
    if (!task) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Task is not found'));
    }

    const comment = await CommentRepository.createComment(taskId, userId, text);
    const result = CommentSerializer.serialize(comment, 0);

    return res.json(wrapResult<CommentResult>(result));
};

export const updateComment = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = getUserIdByReq(req);

    if (!await CommentRepository.isUserComment(commentId, userId)) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Comment is not found'));
    }

    const comment = await CommentRepository.updateComment(commentId, text);
    const likes = await CommentRepository.getCommentLikes(commentId);
    const result = CommentSerializer.serialize(comment, likes);

    return res.json(wrapResult<CommentResult>(result));
};

export const deleteComment = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const userId = getUserIdByReq(req);

    if (!await CommentRepository.isUserComment(commentId, userId)) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Comment is not found'));
    }

    const comment = await CommentRepository.deleteComment(commentId);
    const likes = await CommentRepository.getCommentLikes(commentId);
    const result = CommentSerializer.serialize(comment, likes);

    return res.json(wrapResult<CommentResult>(result));
};

export const addCommentLike = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const userId = getUserIdByReq(req);

    if (!await CommentRepository.hasAccessToProject(commentId, userId)) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Comment is not found'));
    }

    const commentLike = await CommentRepository.addLike(commentId, userId);
    const likeCounts = await CommentRepository.getCommentLikes(commentId);

    return res.json(wrapResult({
        id: commentLike.commentId,
        likes: likeCounts,
    }));
};

export const deleteCommentLike = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const userId = getUserIdByReq(req);

    if (!await CommentRepository.hasAccessToProject(commentId, userId)) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Comment is not found'));
    }

    const commentLike = await CommentRepository.getCommentLikes(commentId);
    if (!commentLike) {
        return res.status(StatusCode.ClientErrorNotFound).json(wrapError('Comment like is not found'));
    }

    await CommentRepository.removeLike(commentId, userId);
    const likeCounts = await CommentRepository.getCommentLikes(commentId);

    return res.json(wrapResult({
        id: commentId,
        likes: likeCounts,
    }));
};