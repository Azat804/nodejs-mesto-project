import { Router } from 'express';
import {
  getCards, createCard, deleteCardById, likeCard, dislikeCard,
} from '../controllers/cards';

const router = Router();

router.get('/cards', getCards);
router.post('/cards', createCard);
router.delete('/cards/:cardId', deleteCardById);
router.put('/cards/:cardId/likes', likeCard);
router.delete('/cards/:cardId/likes', dislikeCard);

export default router;
