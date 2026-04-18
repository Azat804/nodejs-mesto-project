import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import { UNIQUE_ERROR_CODE } from '../constants/error-codes';
import NotFoundError from '../errors/not-found-error';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

dotenv.config({ path: ['./.env', './.env.deploy'] });

export const getUsers = (
  req: Request,
  res: Response,
  next: NextFunction,
) => User.find({})
  .then((users) => res.send(users))
  .catch((error) => next(error));

export const getUserById = (
  req: Request,
  res: Response,
  next: NextFunction,
) => User.findById(req.params.userId)
  .orFail()
  .then((user) => res.send({ user }))
  .catch((error) => (error instanceof mongoose.Error.DocumentNotFoundError
    ? next(new NotFoundError('Пользователь по указанному _id не найден'))
    : next(error)));

export const createUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  User.init().then(() => bcrypt.hash(password, 10).then((hash: string) => User.create({
    name,
    about,
    avatar,
    email,
    password: hash,
  })))
    .then((user) => res.status(201).send(user))
    .catch((error) => {
      if (error instanceof Error && error.message.includes(UNIQUE_ERROR_CODE)) {
        return next(new ConflictError('Пользователь с такими данными уже существует'));
      }
      if (error instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      }
      return next(error);
    });
};

export const updateUserProfile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, about } = req.body;
  return User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send(user))
    .catch((error) => {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Пользователь по указанному _id не найден'));
      } if (error instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля пользователя'));
      }
      return next(error);
    });
};

export const updateUserAvatar = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { avatar } = req.body;
  return User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send(user))
    .catch((error) => {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Пользователь по указанному _id не найден'));
      } if (error instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError('Переданы некорректные данные при обновлении аватара'));
      }
      return next(error);
    });
};

export const login = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((error) => next(error));
};

export const getCurrentUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => User.findById(req.user._id)
  .orFail()
  .then((user) => res.send(user))
  .catch((error) => (error instanceof mongoose.Error.DocumentNotFoundError
    ? next(new NotFoundError('Пользователь по указанному _id не найден'))
    : next(error)));
