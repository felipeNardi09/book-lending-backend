import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import { xss } from 'express-xss-sanitizer';
import AppError from './src/utils/appError.js';
import usersRouter from './src/routes/usersRouter.js';
import booksRouter from './src/routes/booksRouter.js';
import loanRouter from './src/routes/loansRouter.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(mongoSanitize());
app.use(bodyParser.json({ limit: '1kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1kb' }));
app.use(xss());

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/books', booksRouter);
app.use('/api/v1/loans', loanRouter);

app.all('*', (req, res, next) => {
    return next(new AppError('There is no route with provided url.', 404));
});

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        name: err.name,
        stack: err.stack
    });
});

export default app;
