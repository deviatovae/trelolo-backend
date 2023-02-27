import express from 'express';
import dotenv from 'dotenv';
import { router } from './routes';
import cors from 'cors';
import responseTime from 'response-time';
import { responseTimeCallback } from './middleware/middleware';
import i18next from 'i18next';
import i18middleware from 'i18next-http-middleware';
import Backend from 'i18next-fs-backend';


dotenv.config();

const port = process.env.PORT;
const app = express();

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

i18next
    .use(Backend)
    .use(i18middleware.LanguageDetector).init({
    preload: ['en', 'ru'],
    fallbackLng: 'en',
    backend: {
        loadPath: __dirname + '/locales/{{ns}}.{{lng}}.yaml'
    },
});

app.use(i18middleware.handle(i18next));
app.use(responseTime(responseTimeCallback));
app.use(express.json());
app.use(cors());
app.use(router);

process.on('uncaughtException', function (err) {
    console.error('Exception: ', err);
});
