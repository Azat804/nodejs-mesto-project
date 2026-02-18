import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import Card from '../models/card';
import NotFoundError from '../errors/not-found-error';

export const getCards = (req: Request, res: Response, next: NextFunction) => Card.find({})
  .then((cards) => res.send({ cards }))
  .catch((error) => next(error));

export const createCard = (req: Request, res: Response, next: NextFunction) => {
  const { name, link } = req.body;
  const userId = req.user._id;
  return Card.create({ name, link, owner: userId })
    .then((card) => res.status(201).send({ card }))
    .catch((error) => (error instanceof mongoose.Error.ValidationError
      ? next(new BadRequestError('Переданы некорректные данные при создании карточки')) : next(error)));
};

export const deleteCardById = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Card
  .findCardByIdAndOwner(req.params.cardId, req.user._id)
  .then(() => Card.findByIdAndDelete(req.params.cardId))
  .then((card) => res.send({ card }))
  .catch((error) => next(error));

export const likeCard = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Card
  .findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true, runValidators: true },
  ).orFail()
  .then((card) => res.send({ card }))
  .catch((error) => {
    if (error instanceof mongoose.Error.DocumentNotFoundError) {
      return next(new NotFoundError('Передан несуществующий _id карточки'));
    }
    if (error instanceof mongoose.Error.ValidationError) {
      return next(new BadRequestError('Переданы некорректные данные для постановки лайка'));
    }
    return next(error);
  });

export const dislikeCard = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true, runValidators: true },
).orFail()
  .then((card) => res.send({ card }))
  .catch((error) => {
    if (error instanceof mongoose.Error.DocumentNotFoundError) {
      return next(new NotFoundError('Передан несуществующий _id карточки'));
    }
    if (error instanceof mongoose.Error.ValidationError) {
      return next(new BadRequestError('Переданы некорректные данные для снятии лайка'));
    }
    return next(error);
  });
