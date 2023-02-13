import express from 'express';
import dotenv from 'dotenv';
import { router } from './routes';
import cors from 'cors';
import responseTime from 'response-time';

dotenv.config();

const port = process.env.PORT;
const app = express();

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

app.use((req) => {
    console.log(`[${req.method}] ${req.url}`);
});
app.use(responseTime((req, res, time) => {
    console.log(`[${req.method || '?'}] ${req.url || '?'} - ${(time / 1000).toFixed(3)}`);
}));

app.use(express.json());
app.use(cors());
app.use(router);

process.on('uncaughtException', function (err) {
    console.error('Exception: ', err);
});
