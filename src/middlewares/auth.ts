import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import NotAuthorizedError from '../errors/not-authorized-error';

interface IPayload {
  _id: string,
}

export default (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.jwt;
  let payload: IPayload;
  try {
    payload = jwt.verify(token, 'super-strong-secret') as IPayload;
  } catch (error) {
    return next(new NotAuthorizedError('Необходима авторизация'));
  }
  req.user = payload;
  return next();
};
