import { Router } from 'express';
import { login, register } from './controller/user';
import middleware from './middleware/middleware';
import { createProject, deleteProject, getProjects, updateProject } from './controller/project';
import { createSection, deleteSection, getSections, updateSection } from './controller/section';

export const router = Router();

router.post('/user/register', ...register);
router.post('/user/login', ...login);

router.use(middleware.auth);

router.get('/projects', getProjects);
router.post('/projects', ...createProject);
router.patch('/projects/:id', ...updateProject);
router.delete('/projects/:id', deleteProject);

router.get('/projects/:projectId/sections', getSections);
router.post('/projects/:projectId/sections', ...createSection);
router.patch('/projects/:projectId/sections/:sectionId', ...updateSection);
router.delete('/projects/:projectId/sections/:sectionId', deleteSection);
