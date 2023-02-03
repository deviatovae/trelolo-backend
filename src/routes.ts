import { Router } from 'express';
import { createBoard, createBoardValidation, getBoard, getBoards } from './controller/boards';
import { login, register } from './controller/user';
import middleware from './middleware/middleware';

export const router = Router();

router.post('/user/register', ...register);
router.post('/user/login', ...login);

router.use(middleware.auth);

router.get('/boards', getBoards);
router.get('/boards/:id', getBoard);
router.post('/boards', createBoardValidation, createBoard);
