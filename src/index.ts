import express from 'express';
import dotenv from 'dotenv';
import { router } from './routes';
import cors from 'cors';
import responseTime from 'response-time';
import { responseTimeCallback } from './middleware/middleware';

dotenv.config();

const port = process.env.PORT;
const app = express();

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

app.use(responseTime(responseTimeCallback));
app.use(express.json());
app.use(cors());
app.use(router);

process.on('uncaughtException', function (err) {
    console.error('Exception: ', err);
});
