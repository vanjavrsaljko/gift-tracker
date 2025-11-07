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
      bought: false,
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
export const getPublicWishlists = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).select('name wishlists');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the requesting user's ID (if authenticated)
    const requestingUserId = req.user?._id?.toString();

    // Filter wishlists: public OR shared with requesting user
    const visibleWishlists = user.wishlists
      .filter((wishlist: any) => {
        // Always show public wishlists
        if (wishlist.visibility === 'public') return true;
        
        // Show private wishlists if shared with requesting user
        if (requestingUserId && wishlist.sharedWith) {
          return wishlist.sharedWith.some(
            (id: any) => id.toString() === requestingUserId
          );
        }
        
        return false;
      })
      .map((wishlist: any) => ({
        _id: wishlist._id,
        name: wishlist.name,
        description: wishlist.description,
        visibility: wishlist.visibility,
        isShared: wishlist.visibility === 'private' && requestingUserId && wishlist.sharedWith?.some(
          (id: any) => id.toString() === requestingUserId
        ),
        items: wishlist.items.filter((item: any) => !item.reserved && !item.bought),
      }));

    res.json({
      userName: user.name,
      wishlists: visibleWishlists,
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

    // Check if item is already reserved by someone else
    if (item.reserved && item.reservedBy?.toString() !== userId) {
      return res.status(400).json({ message: 'Item already reserved by someone else' });
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

// @desc    Unreserve a wishlist item (owner only)
// @route   DELETE /api/wishlists/:wishlistId/items/:itemId/reserve
// @access  Private
export const unreserveWishlistItem = async (req: any, res: Response) => {
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

    const item = wishlist.items.find(
      (i: any) => i._id.toString() === req.params.itemId
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (!item.reserved) {
      return res.status(400).json({ message: 'Item is not reserved' });
    }

    // Owner can unreserve any item
    item.reserved = false;
    item.reservedBy = undefined;

    await user.save();
    res.json({ 
      message: 'Item unreserved successfully',
      item 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark wishlist item as bought
// @route   PUT /api/wishlists/:wishlistId/items/:itemId/bought
// @access  Private
export const markItemBought = async (req: any, res: Response) => {
  try {
    const { bought } = req.body;

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

    item.bought = bought !== undefined ? bought : true;

    await user.save();
    res.json({ 
      message: bought ? 'Item marked as bought' : 'Item marked as not bought',
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

    // Owner can delete any item (including reserved ones)
    wishlist.items.splice(itemIndex, 1);
    await user.save();
    res.json({ message: 'Wishlist item removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Share wishlist with friends
// @route   POST /api/wishlists/:id/share
// @access  Private
export const shareWishlist = async (req: any, res: Response) => {
  try {
    const { friendIds } = req.body; // Array of friend user IDs

    if (!Array.isArray(friendIds) || friendIds.length === 0) {
      return res.status(400).json({ message: 'Friend IDs array required' });
    }

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

    // Initialize sharedWith if it doesn't exist
    if (!wishlist.sharedWith) {
      wishlist.sharedWith = [];
    }

    // Add friend IDs to sharedWith (avoid duplicates)
    friendIds.forEach((friendId) => {
      if (!wishlist.sharedWith!.some((id: any) => id.toString() === friendId)) {
        wishlist.sharedWith!.push(friendId as any);
      }
    });

    await user.save();

    res.json({
      message: 'Wishlist shared successfully',
      sharedWith: wishlist.sharedWith,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Unshare wishlist with a friend
// @route   DELETE /api/wishlists/:id/share/:friendId
// @access  Private
export const unshareWishlist = async (req: any, res: Response) => {
  try {
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

    if (!wishlist.sharedWith) {
      return res.status(400).json({ message: 'Wishlist not shared with anyone' });
    }

    // Remove friend from sharedWith
    wishlist.sharedWith = wishlist.sharedWith.filter(
      (id: any) => id.toString() !== req.params.friendId
    ) as any;

    await user.save();

    res.json({
      message: 'Wishlist unshared successfully',
      sharedWith: wishlist.sharedWith,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get friends wishlist is shared with
// @route   GET /api/wishlists/:id/shared
// @access  Private
export const getSharedWith = async (req: any, res: Response) => {
  try {
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

    // Populate sharedWith with user details
    const sharedWithUsers = await User.find({
      _id: { $in: wishlist.sharedWith || [] },
    }).select('name email');

    res.json(sharedWithUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
