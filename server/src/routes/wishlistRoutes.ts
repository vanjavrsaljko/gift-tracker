import express from 'express';
import { protect, optionalAuth } from '../middleware/auth';
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
  unreserveWishlistItem,
  markItemBought,
  shareWishlist,
  unshareWishlist,
  getSharedWith,
} from '../controllers/wishlistController';

const router = express.Router();

// Public route with optional auth - must be before /:id routes
router.get('/public/:userId', optionalAuth, getPublicWishlists);

// Wishlist CRUD
router
  .route('/')
  .get(protect, getWishlists)
  .post(protect, createWishlist);

// Wishlist sharing - must be before /:id routes
router.get('/:id/shared', protect, getSharedWith);
router.post('/:id/share', protect, shareWishlist);
router.delete('/:id/share/:friendId', protect, unshareWishlist);

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

// Unreserve item (private - owner only)
router.delete('/:wishlistId/items/:itemId/reserve', protect, unreserveWishlistItem);

// Mark item as bought (private)
router.put('/:wishlistId/items/:itemId/bought', protect, markItemBought);

// Generic /:id routes - must be last
router
  .route('/:id')
  .put(protect, updateWishlist)
  .delete(protect, deleteWishlist);

export default router;
