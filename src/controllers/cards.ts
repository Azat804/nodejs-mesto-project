import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Card from '../models/card';

import { INCORRECT_DATA_ERROR_CODE, NOT_FOUND_ERROR_CODE, SERVER_ERROR_CODE } from '../constants/error-codes';

export const getCards = (req: Request, res: Response) => Card.find({})
  .then((cards) => res.send({ cards }))
  .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));

export const createCard = (req: Request, res: Response) => {
  const { name, link } = req.body;
  const userId = req.user._id;
  return Card.create({ name, link, owner: userId })
    .then((card) => res.send({ card }))
    .catch((error) => (error instanceof mongoose.Error.ValidationError
      ? res.status(INCORRECT_DATA_ERROR_CODE)
        .send({ message: 'Переданы некорректные данные при создании карточки' }) : res.status(SERVER_ERROR_CODE)
        .send({ message: 'На сервере произошла ошибка' })));
};

export const deleteCardById = (req: Request, res: Response) => Card
  .findByIdAndDelete(req.params.cardId)
  .orFail()
  .then((card) => res.send({ card }))
  .catch((error) => (error instanceof mongoose.Error.DocumentNotFoundError ? res.status(NOT_FOUND_ERROR_CODE).send('Карточка с указанным _id не найдена') : res.status(SERVER_ERROR_CODE).send({ message: 'На сервере произошла ошибка' })));

export const likeCard = (req: Request, res: Response) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true, runValidators: true },
).orFail()
  .then((card) => res.send({ card }))
  .catch((error) => {
    if (error instanceof mongoose.Error.DocumentNotFoundError) {
      return res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Передан несуществующий _id карточки' });
    }
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Переданы некорректные данные для постановки лайка' });
    }
    return res.status(SERVER_ERROR_CODE).send({ message: 'На сервере произошла ошибка' });
  });

export const dislikeCard = (req: Request, res: Response) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true, runValidators: true },
).orFail()
  .then((card) => res.send({ card }))
  .catch((error) => {
    if (error instanceof mongoose.Error.DocumentNotFoundError) {
      return res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Передан несуществующий _id карточки' });
    }
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Переданы некорректные данные для снятии лайка' });
    }
    return res.status(SERVER_ERROR_CODE).send({ message: 'На сервере произошла ошибка' });
  });
