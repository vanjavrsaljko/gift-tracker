import express from 'express';
import { protect } from '../middleware/auth';
import {
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  searchUsers,
  addFriendToGroups,
  removeFriendFromGroup,
} from '../controllers/friendController';

const router = express.Router();

// Search users (must be before /:id routes)
router.get('/search', protect, searchUsers);

// Friend requests
router.get('/requests', protect, getFriendRequests);
router.post('/request', protect, sendFriendRequest);

// Friend management
router.get('/', protect, getFriends);
router.delete('/:id', protect, removeFriend);

// Accept/Decline requests
router.put('/:id/accept', protect, acceptFriendRequest);
router.put('/:id/decline', protect, declineFriendRequest);

// Friend groups
router.post('/:id/groups', protect, addFriendToGroups);
router.delete('/:id/groups/:groupName', protect, removeFriendFromGroup);

export default router;
