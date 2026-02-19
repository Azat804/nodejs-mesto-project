interface IUser {
  _id: string
}

// eslint-disable-next-line no-unused-vars
declare namespace Express {
  export interface Request {
    user: IUser;
  }
}
