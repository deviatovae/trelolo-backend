import { Request, Response } from 'express';
import { body } from 'express-validator';
import StatusCode from 'status-code-enum';

type Board = {
    id: number,
    color: string
};

let lastBoardId = 2;
const boards: Board[] = [
    { id: 1, color: 'pink' },
    { id: 2, color: 'black' },
];

export const getBoards = async (req: Request, res: Response) => {
    res.json(boards);
};

export const getBoard = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const board = boards.find((el) => el.id === id);

    if (!board) {
        res.status(StatusCode.ClientErrorNotFound).json({ error: 'Not found' });
        return;
    }
    res.json(board);
};

export const createBoardValidation = body('color').isLength({ min: 3 });

export const createBoard = (req: Request, res: Response) => {
    lastBoardId += 1;
    const board = {
        id: lastBoardId,
        color: req.body.color
    };
    boards.push(board);
    res.json(board);
};
