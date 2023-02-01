import express from 'express';
import dotenv from 'dotenv';
import { router } from './routes';

dotenv.config();

const port = process.env.PORT;
const app = express();

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

app.use(express.json());
app.use(router);
