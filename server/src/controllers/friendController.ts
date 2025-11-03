import { Response } from 'express';
import Friend from '../models/Friend';
import User from '../models/User';

// @desc    Get all accepted friends
// @route   GET /api/friends
// @access  Private
export const getFriends = async (req: any, res: Response) => {
  try {
    const friends = await Friend.find({
      $or: [
        { userId: req.user._id, status: 'accepted' },
        { friendId: req.user._id, status: 'accepted' },
      ],
    })
      .populate('userId', 'name email')
      .populate('friendId', 'name email')
      .sort({ acceptedAt: -1 });

    // Map to return friend info (not the current user)
    const friendList = friends.map((friendship: any) => {
      const isFriendUser = friendship.userId._id.toString() === req.user._id.toString();
      const friend = isFriendUser ? friendship.friendId : friendship.userId;
      
      return {
        _id: friendship._id,
        friendId: friend._id,
        name: friend.name,
        email: friend.email,
        groups: friendship.groups,
        acceptedAt: friendship.acceptedAt,
      };
    });

    res.json(friendList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get pending friend requests (received)
// @route   GET /api/friends/requests
// @access  Private
export const getFriendRequests = async (req: any, res: Response) => {
  try {
    const requests = await Friend.find({
      friendId: req.user._id,
      status: 'pending',
    })
      .populate('requestedBy', 'name email')
      .sort({ requestedAt: -1 });

    const requestList = requests.map((request: any) => ({
      _id: request._id,
      requestedBy: {
        _id: request.requestedBy._id,
        name: request.requestedBy.name,
        email: request.requestedBy.email,
      },
      requestedAt: request.requestedAt,
    }));

    res.json(requestList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send friend request
// @route   POST /api/friends/request
// @access  Private
export const sendFriendRequest = async (req: any, res: Response) => {
  try {
    const { email } = req.body;

    // Find user by email
    const friendUser = await User.findOne({ email });

    if (!friendUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Can't send request to yourself
    if (friendUser._id?.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if friendship already exists (in either direction)
    const existingFriendship = await Friend.findOne({
      $or: [
        { userId: req.user._id, friendId: friendUser._id },
        { userId: friendUser._id, friendId: req.user._id },
      ],
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return res.status(400).json({ message: 'Already friends' });
      }
      if (existingFriendship.status === 'pending') {
        return res.status(400).json({ message: 'Friend request already sent' });
      }
      if (existingFriendship.status === 'declined') {
        return res.status(400).json({ message: 'Friend request was previously declined' });
      }
    }

    // Create friend request
    const friendRequest = await Friend.create({
      userId: req.user._id,
      friendId: friendUser._id,
      status: 'pending',
      requestedBy: req.user._id,
      requestedAt: new Date(),
      groups: [],
    });

    const populatedRequest = await Friend.findById(friendRequest._id)
      .populate('friendId', 'name email');

    res.status(201).json({
      message: 'Friend request sent',
      request: populatedRequest,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Accept friend request
// @route   PUT /api/friends/:id/accept
// @access  Private
export const acceptFriendRequest = async (req: any, res: Response) => {
  try {
    const friendRequest = await Friend.findById(req.params.id);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Verify the request is for the current user
    if (friendRequest.friendId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    // Verify status is pending
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    // Update status
    friendRequest.status = 'accepted';
    friendRequest.acceptedAt = new Date();
    await friendRequest.save();

    const populatedRequest = await Friend.findById(friendRequest._id)
      .populate('userId', 'name email')
      .populate('friendId', 'name email');

    res.json({
      message: 'Friend request accepted',
      friendship: populatedRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Decline friend request
// @route   PUT /api/friends/:id/decline
// @access  Private
export const declineFriendRequest = async (req: any, res: Response) => {
  try {
    const friendRequest = await Friend.findById(req.params.id);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Verify the request is for the current user
    if (friendRequest.friendId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to decline this request' });
    }

    // Verify status is pending
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    // Update status
    friendRequest.status = 'declined';
    await friendRequest.save();

    res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove friend
// @route   DELETE /api/friends/:id
// @access  Private
export const removeFriend = async (req: any, res: Response) => {
  try {
    const friendship = await Friend.findById(req.params.id);

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    // Verify the current user is part of this friendship
    const isUserInFriendship =
      friendship.userId.toString() === req.user._id.toString() ||
      friendship.friendId.toString() === req.user._id.toString();

    if (!isUserInFriendship) {
      return res.status(403).json({ message: 'Not authorized to remove this friend' });
    }

    await Friend.findByIdAndDelete(req.params.id);

    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search for users by email
// @route   GET /api/friends/search?q=email
// @access  Private
export const searchUsers = async (req: any, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: 'Search query required' });
    }

    // Search for users by email (case-insensitive)
    const users = await User.find({
      email: { $regex: q, $options: 'i' },
      _id: { $ne: req.user._id }, // Exclude current user
    })
      .select('name email')
      .limit(10);

    // Get existing friendships to show status
    const userIds = users.map((user) => user._id);
    const existingFriendships = await Friend.find({
      $or: [
        { userId: req.user._id, friendId: { $in: userIds } },
        { userId: { $in: userIds }, friendId: req.user._id },
      ],
    });

    // Map users with friendship status
    const usersWithStatus = users.map((user: any) => {
      const friendship = existingFriendships.find(
        (f: any) =>
          (f.userId.toString() === req.user._id.toString() && f.friendId.toString() === user._id.toString()) ||
          (f.friendId.toString() === req.user._id.toString() && f.userId.toString() === user._id.toString())
      );

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        friendshipStatus: friendship ? friendship.status : null,
        friendshipId: friendship ? friendship._id : null,
      };
    });

    res.json(usersWithStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add friend to groups
// @route   POST /api/friends/:id/groups
// @access  Private
export const addFriendToGroups = async (req: any, res: Response) => {
  try {
    const { groups } = req.body;

    if (!Array.isArray(groups) || groups.length === 0) {
      return res.status(400).json({ message: 'Groups array required' });
    }

    const friendship = await Friend.findById(req.params.id);

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    // Verify the current user is part of this friendship
    const isUserInFriendship =
      friendship.userId.toString() === req.user._id.toString() ||
      friendship.friendId.toString() === req.user._id.toString();

    if (!isUserInFriendship) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add groups (avoid duplicates)
    const uniqueGroups = [...new Set([...friendship.groups, ...groups])];
    friendship.groups = uniqueGroups;
    await friendship.save();

    res.json({
      message: 'Groups updated',
      groups: friendship.groups,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove friend from group
// @route   DELETE /api/friends/:id/groups/:groupName
// @access  Private
export const removeFriendFromGroup = async (req: any, res: Response) => {
  try {
    const { groupName } = req.params;

    const friendship = await Friend.findById(req.params.id);

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    // Verify the current user is part of this friendship
    const isUserInFriendship =
      friendship.userId.toString() === req.user._id.toString() ||
      friendship.friendId.toString() === req.user._id.toString();

    if (!isUserInFriendship) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Remove group
    friendship.groups = friendship.groups.filter((g) => g !== groupName);
    await friendship.save();

    res.json({
      message: 'Group removed',
      groups: friendship.groups,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
