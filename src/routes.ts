import { Router } from 'express';
import { createBoard, createBoardValidation, getBoard, getBoards } from './controller/boards';

export const router = Router();

router.get('/boards', getBoards);
router.get('/boards/:id', getBoard);
router.post('/boards', createBoardValidation, createBoard);
