import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { celebrate, Joi } from 'celebrate';
import dotenv from 'dotenv';
import usersRouter from './routes/users';
import cardsRouter from './routes/cards';
import { login, createUser } from './controllers/users';
import auth from './middlewares/auth';
import { requestLogger, errorLogger } from './middlewares/logger';
import NotFoundError from './errors/not-found-error';

dotenv.config({ path: ['.env', '.env.deploy'] });
interface IError extends Error {
  statusCode: number,
}

const { PORT = 3000 } = process.env;

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(limiter);
app.use(cors({
  origin: 'https://mestoapp.students.nomorepartiessite.ru',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  login,
);
app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string(),
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  createUser,
);

app.use(auth);

app.use('/', usersRouter);
app.use('/', cardsRouter);
app.use('*', (
  req: Request,
  res: Response,
  next: NextFunction,
) => next(new NotFoundError('Запрашиваемый ресурс не найден')));

app.use(errorLogger);

app.use((
  err: IError,
  req: Request,
  res: Response,
  // eslint-disable-next-line no-unused-vars
  next: NextFunction,
) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
