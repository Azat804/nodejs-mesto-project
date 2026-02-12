import mongoose from 'mongoose';

interface IUser {
  name: string,
  about: string,
  avatar: string
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
}, { versionKey: false });

export default mongoose.model<IUser>('user', userSchema);
