import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import NotAuthorizedError from '../errors/not-authorized-error';

dotenv.config({ path: ['./.env', './.env.deploy'] });

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
    const { JWT_SECRET } = process.env;
    payload = jwt.verify(token, JWT_SECRET as string) as IPayload;
  } catch (error) {
    return next(new NotAuthorizedError('Необходима авторизация'));
  }
  req.user = payload;
  return next();
};
