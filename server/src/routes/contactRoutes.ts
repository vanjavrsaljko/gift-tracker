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
  linkContactToFriend,
  unlinkContactFromFriend,
  getLinkSuggestions,
} from '../controllers/contactController';

const router = express.Router();

router
  .route('/')
  .get(protect, getContacts)
  .post(protect, addContact);

// Link suggestions - must come before /:id routes
router
  .route('/link-suggestions')
  .get(protect, getLinkSuggestions);

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

// Contact-Friend linking routes
router
  .route('/:contactId/link/:friendId')
  .post(protect, linkContactToFriend);

router
  .route('/:contactId/link')
  .delete(protect, unlinkContactFromFriend);

export default router;
