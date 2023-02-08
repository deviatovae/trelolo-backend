import { Router } from 'express';
import { login, loginValidation, register, registerValidation } from './controller/user';
import middleware from './middleware/middleware';
import {
    createProject,
    createProjectValidation,
    deleteProject,
    getProjects,
    updateProject,
    updateProjectValidation
} from './controller/project';
import {
    createSection,
    createSectionValidation,
    deleteSection,
    getSections,
    updateSection,
    updateSectionValidation
} from './controller/section';
import {
    assignMember,
    createTask,
    createTaskValidation,
    deleteTask,
    getTasks, removeAssignee,
    updateTask,
    updateTaskValidation
} from './controller/task';
import { wrapHandler } from './utils/handlerWrapper';
import { addMember, createMemberValidation, getMembers, removeMember } from './controller/member';
import {
    addComment,
    addCommentLike, commentValidation,
    deleteComment,
    deleteCommentLike,
    getComments,
    updateComment
} from './controller/comment';

export const router = Router();

router.post('/user/register', ...registerValidation, wrapHandler(register));
router.post('/user/login', ...loginValidation, wrapHandler(login));

router.use(middleware.auth);

router.get('/projects', wrapHandler(getProjects));
router.post('/projects', ...createProjectValidation, wrapHandler(createProject));
router.patch('/projects/:id', ...updateProjectValidation, wrapHandler(updateProject));
router.delete('/projects/:id', wrapHandler(deleteProject));

router.get('/projects/:projectId/sections', wrapHandler(getSections));
router.post('/projects/:projectId/sections', ...createSectionValidation, wrapHandler(createSection));
router.patch('/sections/:sectionId', ...updateSectionValidation, wrapHandler(updateSection));
router.delete('/sections/:sectionId', wrapHandler(deleteSection));

router.get('/sections/:sectionId/tasks', wrapHandler(getTasks));
router.post('/sections/:sectionId/tasks', ...createTaskValidation, wrapHandler(createTask));
router.patch('/tasks/:taskId', ...updateTaskValidation, wrapHandler(updateTask));
router.delete('/tasks/:taskId', wrapHandler(deleteTask));

router.get('/projects/:projectId/members', wrapHandler(getMembers));
router.post('/projects/:projectId/members', ...createMemberValidation, wrapHandler(addMember));
router.delete('/members/:memberId', wrapHandler(removeMember));

router.post('/tasks/:taskId/assignee', wrapHandler(assignMember));
router.delete('/tasks/:taskId/assignee/:assigneeId', wrapHandler(removeAssignee));

router.get('/tasks/:taskId/comments', wrapHandler(getComments));
router.post('/tasks/:taskId/comments', commentValidation, wrapHandler(addComment));
router.patch('/comments/:commentId', commentValidation, wrapHandler(updateComment));
router.delete('/comments/:commentId', wrapHandler(deleteComment));
router.post('/comments/:commentId/likes', wrapHandler(addCommentLike));
router.delete('/comments/:commentId/likes', wrapHandler(deleteCommentLike));
