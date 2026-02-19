import {
  model, Model, Schema, Document,
} from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import NotAuthorizedError from '../errors/not-authorized-error';

export interface IUser {
  name: string,
  about: string,
  avatar: string,
  email: string,
  password: string
}

interface UserModel extends Model<IUser> {
  // eslint-disable-next-line no-unused-vars
  findUserByCredentials: (email: string, password: string) => Promise<Document<unknown, any, IUser>>
}

const userSchema = new Schema<IUser, UserModel>({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (v: string) => /^https?:\/\/(?:www\.)?\S+\.\S+$/.test(v),
      message: 'Неправильный формат ссылки',
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (v: string) => validator.isEmail(v),
      message: 'Неправильный формат почты',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
}, {
  versionKey: false,
  toJSON: {
    transform: (_doc, ret) => {
      // eslint-disable-next-line no-param-reassign
      delete ret.password;
      return ret;
    },
  },
});

userSchema.static('findUserByCredentials', function findUserByCredentials(email: string, password: string) {
  return this.findOne({ email }).select('+password').then((user) => {
    if (!user) {
      return Promise.reject(new NotAuthorizedError('Неправильные почта или пароль'));
    }
    return bcrypt.compare(password, user.password).then((matched: boolean) => {
      if (!matched) {
        return Promise.reject(new NotAuthorizedError('Неправильные почта или пароль'));
      }
      return user;
    });
  });
});

export default model<IUser, UserModel>('user', userSchema);
