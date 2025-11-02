import { Request, Response } from 'express';
import User from '../models/User';

// ============================================
// WISHLIST CRUD OPERATIONS
// ============================================

// @desc    Get all user's wishlists
// @route   GET /api/wishlists
// @access  Private
export const getWishlists = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('wishlists');
    
    if (user) {
      res.json(user.wishlists);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new wishlist
// @route   POST /api/wishlists
// @access  Private
export const createWishlist = async (req: any, res: Response) => {
  try {
    const { name, description, visibility } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
      const newWishlist = {
        name,
        description: description || '',
        visibility: visibility || 'public',
        items: [],
        createdAt: new Date(),
      };

      user.wishlists.push(newWishlist);
      await user.save();

      const createdWishlist = user.wishlists[user.wishlists.length - 1];
      res.status(201).json(createdWishlist);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a wishlist
// @route   PUT /api/wishlists/:id
// @access  Private
export const updateWishlist = async (req: any, res: Response) => {
  try {
    const { name, description, visibility } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wishlist = user.wishlists.find(
      (w: any) => w._id.toString() === req.params.id
    );

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    if (name !== undefined) wishlist.name = name;
    if (description !== undefined) wishlist.description = description;
    if (visibility !== undefined) wishlist.visibility = visibility;

    await user.save();
    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a wishlist
// @route   DELETE /api/wishlists/:id
// @access  Private
export const deleteWishlist = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wishlistIndex = user.wishlists.findIndex(
      (w: any) => w._id.toString() === req.params.id
    );

    if (wishlistIndex === -1) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    user.wishlists.splice(wishlistIndex, 1);
    await user.save();
    res.json({ message: 'Wishlist deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// WISHLIST ITEM OPERATIONS
// ============================================

// @desc    Add item to wishlist
// @route   POST /api/wishlists/:id/items
// @access  Private
export const addWishlistItem = async (req: any, res: Response) => {
  try {
    const { name, description, link, price } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wishlist = user.wishlists.find(
      (w: any) => w._id.toString() === req.params.id
    );

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const wishlistItem = {
      name,
      description,
      link,
      price,
      reserved: false,
    };

    wishlist.items.push(wishlistItem);
    await user.save();

    const newItem = wishlist.items[wishlist.items.length - 1];
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get items in a wishlist
// @route   GET /api/wishlists/:id/items
// @access  Private
export const getWishlistItems = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('wishlists');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wishlist = user.wishlists.find(
      (w: any) => w._id.toString() === req.params.id
    );

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    res.json(wishlist.items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get public wishlists by user ID
// @route   GET /api/wishlists/public/:userId
// @access  Public
export const getPublicWishlists = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).select('name wishlists');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only return public wishlists with non-reserved items
    const publicWishlists = user.wishlists
      .filter((wishlist: any) => wishlist.visibility === 'public')
      .map((wishlist: any) => ({
        _id: wishlist._id,
        name: wishlist.name,
        description: wishlist.description,
        items: wishlist.items.filter((item: any) => !item.reserved),
      }));

    res.json({
      userName: user.name,
      wishlists: publicWishlists,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update wishlist item
// @route   PUT /api/wishlists/:wishlistId/items/:itemId
// @access  Private
export const updateWishlistItem = async (req: any, res: Response) => {
  try {
    const { name, description, link, price } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wishlist = user.wishlists.find(
      (w: any) => w._id.toString() === req.params.wishlistId
    );

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const item = wishlist.items.find(
      (i: any) => i._id.toString() === req.params.itemId
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (link !== undefined) item.link = link;
    if (price !== undefined) item.price = price;

    await user.save();
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reserve a wishlist item
// @route   PUT /api/wishlists/:wishlistId/items/:itemId/reserve
// @access  Public
export const reserveWishlistItem = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const { wishlistId, itemId } = req.params;

    // Find user by searching through wishlists
    const user = await User.findOne({
      'wishlists._id': wishlistId,
    });

    if (!user) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const wishlist = user.wishlists.find(
      (w: any) => w._id.toString() === wishlistId
    );

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const item = wishlist.items.find(
      (i: any) => i._id.toString() === itemId
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.reserved) {
      return res.status(400).json({ message: 'Item already reserved' });
    }

    item.reserved = true;
    item.reservedBy = userId || null;

    await user.save();

    res.json({ 
      message: 'Item reserved successfully',
      item 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete wishlist item
// @route   DELETE /api/wishlists/:wishlistId/items/:itemId
// @access  Private
export const deleteWishlistItem = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wishlist = user.wishlists.find(
      (w: any) => w._id.toString() === req.params.wishlistId
    );

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const itemIndex = wishlist.items.findIndex(
      (i: any) => i._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }

    wishlist.items.splice(itemIndex, 1);
    await user.save();
    res.json({ message: 'Wishlist item removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
