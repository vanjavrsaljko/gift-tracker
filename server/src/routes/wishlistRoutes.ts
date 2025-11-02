import express from 'express';
import { protect } from '../middleware/auth';
import {
  getWishlists,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  addWishlistItem,
  getWishlistItems,
  updateWishlistItem,
  deleteWishlistItem,
  getPublicWishlists,
  reserveWishlistItem,
  shareWishlist,
  unshareWishlist,
  getSharedWith,
} from '../controllers/wishlistController';

const router = express.Router();

// Public route - must be before /:id routes
router.get('/public/:userId', getPublicWishlists);

// Wishlist CRUD
router
  .route('/')
  .get(protect, getWishlists)
  .post(protect, createWishlist);

router
  .route('/:id')
  .put(protect, updateWishlist)
  .delete(protect, deleteWishlist);

// Wishlist items CRUD
router
  .route('/:id/items')
  .get(protect, getWishlistItems)
  .post(protect, addWishlistItem);

router
  .route('/:wishlistId/items/:itemId')
  .put(protect, updateWishlistItem)
  .delete(protect, deleteWishlistItem);

// Reserve item (public)
router.put('/:wishlistId/items/:itemId/reserve', reserveWishlistItem);

// Wishlist sharing
router.get('/:id/shared', protect, getSharedWith);
router.post('/:id/share', protect, shareWishlist);
router.delete('/:id/share/:friendId', protect, unshareWishlist);

export default router;
