import { Router } from 'express';
import { createBoard, createBoardValidation, getBoard, getBoards } from './controller/boards';
import { authorize, register } from './controller/user';
import middleware from './middleware/middleware';

const authorizeRouter = Router();
authorizeRouter.use(middleware.auth);

authorizeRouter.get('/boards', getBoards);
authorizeRouter.get('/boards/:id', getBoard);
authorizeRouter.post('/boards', createBoardValidation, createBoard);

const anonymousRouter = Router();
anonymousRouter.post('/user/register', ...register);
anonymousRouter.post('/user/authorize', ...authorize);

export const routers = [
    authorizeRouter,
    anonymousRouter,
];
