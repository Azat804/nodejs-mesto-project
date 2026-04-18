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
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new NotAuthorizedError('Необходима авторизация'));
  }
  const token = authorization.replace('Bearer ', '');
  let payload: IPayload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET as string) as IPayload;
  } catch (error) {
    return next(new NotAuthorizedError('Необходима авторизация'));
  }
  req.user = payload;
  return next();
};
