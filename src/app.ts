import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import usersRouter from './routes/users';
import cardsRouter from './routes/cards';

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  req.user = {
    _id: '69865c686f8fd00a5450ffd1',
  };

  next();
});

app.use('/', usersRouter);
app.use('/', cardsRouter);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
