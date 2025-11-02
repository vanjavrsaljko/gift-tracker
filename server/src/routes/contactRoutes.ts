import express from 'express';
import { protect } from '../middleware/auth';
import {
  addContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
  addGiftIdea,
  updateGiftIdea,
  deleteGiftIdea,
  toggleGiftIdeaPurchased,
} from '../controllers/contactController';

const router = express.Router();

router
  .route('/')
  .get(protect, getContacts)
  .post(protect, addContact);

router
  .route('/:id')
  .get(protect, getContactById)
  .put(protect, updateContact)
  .delete(protect, deleteContact);

router
  .route('/:id/gift-ideas')
  .post(protect, addGiftIdea);

router
  .route('/:contactId/gift-ideas/:giftIdeaId')
  .put(protect, toggleGiftIdeaPurchased);

router
  .route('/:contactId/gift-ideas/:giftIdeaId/update')
  .put(protect, updateGiftIdea);

router
  .route('/:contactId/gift-ideas/:giftIdeaId')
  .delete(protect, deleteGiftIdea);

export default router;
