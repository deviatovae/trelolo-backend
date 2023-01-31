import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT;
const app = express();

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.send('Hello world!');
});
