import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit';
import usersRouter from './routes/users';
import cardsRouter from './routes/cards';
import { NOT_FOUND_ERROR_CODE } from './constants/error-codes';

const { PORT = 3000 } = process.env;

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  req.user = {
    _id: '698cdad6d4198787cbb0c126',
  };
  next();
});

app.use('/', usersRouter);
app.use('/', cardsRouter);
app.use('*', (req: Request, res: Response) => res.status(NOT_FOUND_ERROR_CODE)
  .send({ message: 'Запрашиваемый ресурс не найден' }));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
