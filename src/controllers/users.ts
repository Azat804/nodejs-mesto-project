import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/user';

import { INCORRECT_DATA_ERROR_CODE, NOT_FOUND_ERROR_CODE, SERVER_ERROR_CODE } from '../constants/error-codes';

export const getUsers = (req: Request, res: Response) => User.find({})
  .then((users) => res.send(users))
  .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));

export const getUserById = (req: Request, res: Response) => User.findById(req.params.userId)
  .orFail()
  .then((user) => res.send({ user }))
  .catch((error) => (error instanceof mongoose.Error.DocumentNotFoundError
    ? res.status(NOT_FOUND_ERROR_CODE)
      .send({ message: 'Пользователь по указанному _id не найден' })
    : res.status(SERVER_ERROR_CODE).send({ message: 'На сервере произошла ошибка' })));

export const createUser = (req: Request, res: Response) => {
  const { name, about, avatar } = req.body;
  return User.create({ name, about, avatar })
    .then((user) => res.send({ user }))
    .catch((error) => (error instanceof mongoose.Error.ValidationError
      ? res.status(INCORRECT_DATA_ERROR_CODE)
        .send({ message: 'Переданы некорректные данные при создании пользователя' })
      : res.status(SERVER_ERROR_CODE).send({ message: 'На сервере произошла ошибка' })));
};

export const updateUserProfile = (req: Request, res: Response) => {
  const { name, about } = req.body;
  return User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send({ user }))
    .catch((error) => {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Пользователь по указанному _id не найден' });
      } if (error instanceof mongoose.Error.ValidationError) {
        return res.status(INCORRECT_DATA_ERROR_CODE)
          .send({ message: 'Переданы некорректные данные при обновлении профиля пользователя' });
      }
      return res.status(SERVER_ERROR_CODE).send({ message: 'На сервере произошла ошибка' });
    });
};

export const updateUserAvatar = (req: Request, res: Response) => {
  const { avatar } = req.body;
  return User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send({ user }))
    .catch((error) => {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Пользователь по указанному _id не найден' });
      } if (error instanceof mongoose.Error.ValidationError) {
        return res.status(INCORRECT_DATA_ERROR_CODE)
          .send({ message: 'Переданы некорректные данные при обновлении аватара' });
      }
      return res.status(SERVER_ERROR_CODE).send({ message: 'На сервере произошла ошибка' });
    });
};
