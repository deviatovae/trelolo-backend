import { Router } from 'express';
import {
    createUser,
    createUserValidation,
    getUser,
    login,
    loginValidation,
    updateUser,
    updateUserValidation
} from './controller/user';
import middleware from './middleware/middleware';
import {
    createProject,
    createProjectValidation,
    deleteProject,
    deleteProjectValidation,
    getProjects,
    updateProject,
    updateProjectValidation
} from './controller/project';
import {
    createSection,
    createSectionValidation,
    deleteSection,
    deleteSectionValidation,
    getSections,
    getSectionValidation,
    moveSection,
    moveSectionValidation,
    updateSection,
    updateSectionValidation
} from './controller/section';
import {
    assignMember,
    assignMemberValidation,
    createTask,
    createTaskValidation,
    deleteTask,
    deleteTaskValidation,
    getAllTasks,
    getAllTasksValidation,
    getTasks,
    getTaskValidation,
    moveTask,
    moveTaskValidation,
    removeAssignee,
    removeAssigneeValidation,
    updateTask,
    updateTaskValidation
} from './controller/task';
import { wrapHandler } from './utils/handlerWrapper';
import {
    addMember,
    addMembersValidation,
    getMembers,
    getMembersValidation,
    removeMember,
    removeMembersValidation
} from './controller/member';
import {
    addComment,
    addCommentLike,
    addCommentLikeValidation,
    addCommentValidation,
    deleteComment,
    deleteCommentLike,
    deleteCommentLikeValidation,
    deleteCommentValidation,
    getComments,
    getCommentsValidation,
    updateComment,
    updateCommentValidation
} from './controller/comment';

export const router = Router();

router.post('/user/register', ...createUserValidation, wrapHandler(createUser));
router.post('/user/login', ...loginValidation, wrapHandler(login));

router.use(middleware.auth);

router.get('/user', wrapHandler(getUser));
router.patch('/user', ...updateUserValidation, wrapHandler(updateUser));

router.get('/projects', wrapHandler(getProjects));
router.post('/projects', ...createProjectValidation, wrapHandler(createProject));
router.patch('/projects/:id', ...updateProjectValidation, wrapHandler(updateProject));
router.delete('/projects/:id', ...deleteProjectValidation, wrapHandler(deleteProject));

router.get('/projects/:projectId/sections', ...getSectionValidation, wrapHandler(getSections));
router.post('/projects/:projectId/sections', ...createSectionValidation, wrapHandler(createSection));
router.patch('/sections/:sectionId', ...updateSectionValidation, wrapHandler(updateSection));
router.delete('/sections/:sectionId', ...deleteSectionValidation, wrapHandler(deleteSection));
router.patch('/sections/:sectionId/move', ...moveSectionValidation, wrapHandler(moveSection));

router.get('/sections/:sectionId/tasks', ...getTaskValidation, wrapHandler(getTasks));
router.post('/sections/:sectionId/tasks', ...createTaskValidation, wrapHandler(createTask));
router.get('/tasks', ...getAllTasksValidation, wrapHandler(getAllTasks));
router.patch('/tasks/:taskId', ...updateTaskValidation, wrapHandler(updateTask));
router.delete('/tasks/:taskId', ...deleteTaskValidation, wrapHandler(deleteTask));
router.patch('/tasks/:taskId/move/:sectionId', ...moveTaskValidation, wrapHandler(moveTask));

router.get('/projects/:projectId/members', ...getMembersValidation, wrapHandler(getMembers));
router.post('/projects/:projectId/members', ...addMembersValidation, wrapHandler(addMember));

router.delete('/members/:memberId', ...removeMembersValidation, wrapHandler(removeMember));
router.post('/tasks/:taskId/assignee', ...assignMemberValidation, wrapHandler(assignMember));
router.delete('/tasks/:taskId/assignee/:assigneeId', ...removeAssigneeValidation, wrapHandler(removeAssignee));

router.get('/tasks/:taskId/comments', ...getCommentsValidation, wrapHandler(getComments));
router.post('/tasks/:taskId/comments', ...addCommentValidation, wrapHandler(addComment));
router.patch('/comments/:commentId', ...updateCommentValidation, wrapHandler(updateComment));
router.delete('/comments/:commentId', ...deleteCommentValidation, wrapHandler(deleteComment));
router.post('/comments/:commentId/likes', ...addCommentLikeValidation, wrapHandler(addCommentLike));
router.delete('/comments/:commentId/likes', ...deleteCommentLikeValidation, wrapHandler(deleteCommentLike));
