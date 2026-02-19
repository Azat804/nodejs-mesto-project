import {
  model, Model, Schema, Document,
} from 'mongoose';
import ForbiddenError from '../errors/forbidden-error';
import NotFoundError from '../errors/not-found-error';

interface ICard {
  name: string,
  link: string,
  owner: Schema.Types.ObjectId,
  about: string,
  likes: Array<Schema.Types.ObjectId>,
  createdAt: Schema.Types.Date
}

interface CardModel extends Model<ICard> {
  // eslint-disable-next-line no-unused-vars
  findCardByIdAndOwner: (cardId: string, userId: string) => Promise<Document<unknown, any, ICard>>
}

const cardSchema = new Schema<ICard>({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  link: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => /^https?:\/\/(?:www\.)?\S+\.\S+$/.test(v),
      message: 'Неправильный формат ссылки',
    },
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    default: undefined,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

cardSchema.static('findCardByIdAndOwner', function findCardByIdAndOwner(cardId: string, userId: string) {
  return this.findById(cardId).then((card: ICard) => {
    if (!card) {
      return Promise.reject(new NotFoundError('Карточка с указанным _id не найдена'));
    }
    if (String(card.owner) !== userId) {
      return Promise.reject(new ForbiddenError('У вас нет доступа к этому ресурсу'));
    }
    return card;
  });
});

export default model<ICard, CardModel>('card', cardSchema);
