# Phase 2: Friend System Implementation Plan

**Branch**: `feature/phase2-friend-system`  
**Status**: 🚧 Planning  
**Started**: November 2, 2025

## Overview

Implement a comprehensive friend system that enables users to:
- Add and manage friends
- Send and accept friend requests
- Share private wishlists with specific friends
- Organize friends into groups for granular sharing control

## Goals

### Primary Goals
1. **Friend Management**: Users can add, remove, and view their friends
2. **Friend Requests**: Implement request/accept/decline workflow
3. **Private Wishlist Sharing**: Enable sharing private wishlists with selected friends
4. **Friend Groups**: Organize friends into categories (e.g., "Family", "Close Friends", "Coworkers")

### Secondary Goals
- Notifications for friend requests and wishlist shares
- Search for users by email or name
- Friend activity feed (optional)

## Technical Architecture

### Database Schema Changes

#### New Friend Model
```typescript
Friend {
  _id: ObjectId
  userId: ObjectId          // User who owns this friend relationship
  friendId: ObjectId        // The friend's user ID
  status: 'pending' | 'accepted' | 'declined'
  requestedBy: ObjectId     // Who initiated the request
  requestedAt: Date
  acceptedAt?: Date
  groups: string[]          // Friend groups (e.g., ["Family", "Close Friends"])
}
```

#### Update Wishlist Schema
```typescript
Wishlist {
  _id: ObjectId
  name: string
  description?: string
  visibility: 'public' | 'private'
  items: [WishlistItem]
  createdAt: Date
  sharedWith?: ObjectId[]   // NEW: Array of friend IDs who can view this wishlist
}
```

### API Endpoints

#### Friend Management
- `GET /api/friends` - Get all user's friends (accepted)
- `GET /api/friends/requests` - Get pending friend requests
- `POST /api/friends/request` - Send friend request
- `PUT /api/friends/:id/accept` - Accept friend request
- `PUT /api/friends/:id/decline` - Decline friend request
- `DELETE /api/friends/:id` - Remove friend
- `GET /api/friends/search?q=email` - Search for users to add as friends

#### Friend Groups
- `GET /api/friends/groups` - Get all friend groups
- `POST /api/friends/:id/groups` - Add friend to groups
- `DELETE /api/friends/:id/groups/:groupName` - Remove friend from group

#### Wishlist Sharing
- `GET /api/wishlists/:id/shared` - Get friends this wishlist is shared with
- `POST /api/wishlists/:id/share` - Share wishlist with friends
- `DELETE /api/wishlists/:id/share/:friendId` - Unshare with specific friend
- `GET /api/wishlists/shared-with-me` - Get wishlists shared with current user

### Frontend Components

#### New Pages
1. **Friends Page** (`/friends`)
   - List of accepted friends
   - Pending friend requests section
   - Search/add friends functionality
   - Friend groups management

2. **Friend Profile Modal**
   - View friend's public information
   - See shared wishlists
   - Manage friend groups
   - Remove friend option

#### Updated Components
1. **Wishlist Page**
   - Add "Share with Friends" button for private wishlists
   - Friend selector modal
   - List of friends wishlist is shared with

2. **Dashboard**
   - Friend requests notification badge
   - Shared wishlists section

3. **Navigation**
   - Add "Friends" link
   - Notification badge for pending requests

## Implementation Phases

### Phase 2.1: Friend Management (Week 1)
- [ ] Create Friend model and schema
- [ ] Implement friend request endpoints
- [ ] Create Friends page UI
- [ ] Add friend search functionality
- [ ] Implement accept/decline workflow
- [ ] Add remove friend functionality

### Phase 2.2: Friend Groups (Week 1)
- [ ] Add groups field to Friend model
- [ ] Implement group management endpoints
- [ ] Create group management UI
- [ ] Add friend to multiple groups
- [ ] Filter friends by group

### Phase 2.3: Private Wishlist Sharing (Week 2)
- [ ] Update Wishlist model with sharedWith field
- [ ] Implement wishlist sharing endpoints
- [ ] Create share modal UI
- [ ] Add friend selector with group filter
- [ ] Update wishlist permissions logic
- [ ] Show shared wishlists on Friends page

### Phase 2.4: Notifications & Polish (Week 2)
- [ ] Add notification system for friend requests
- [ ] Add notification for wishlist shares
- [ ] Implement notification badge in navigation
- [ ] Add activity feed (optional)
- [ ] Testing and bug fixes
- [ ] Documentation updates

## User Stories

### Friend Management
1. As a user, I want to search for friends by email so I can add them
2. As a user, I want to send friend requests so I can connect with others
3. As a user, I want to accept/decline friend requests so I control my friend list
4. As a user, I want to remove friends so I can manage my connections

### Friend Groups
5. As a user, I want to organize friends into groups so I can manage them better
6. As a user, I want to add a friend to multiple groups (e.g., "Family" and "Close Friends")
7. As a user, I want to filter friends by group so I can find them easily

### Wishlist Sharing
8. As a user, I want to share private wishlists with specific friends
9. As a user, I want to share a wishlist with an entire friend group
10. As a user, I want to see which friends can view my private wishlists
11. As a user, I want to view wishlists that friends have shared with me
12. As a user, I want to unshare a wishlist from specific friends

### Notifications
13. As a user, I want to be notified when someone sends me a friend request
14. As a user, I want to be notified when someone shares a wishlist with me
15. As a user, I want to see a badge showing pending friend requests

## Security Considerations

1. **Privacy**: Users can only see friends' public wishlists unless explicitly shared
2. **Permissions**: Only wishlist owners can share/unshare their wishlists
3. **Friend Verification**: Prevent duplicate friend requests
4. **Data Access**: Users can only access wishlists they own or that are shared with them
5. **Request Spam**: Limit friend request frequency to prevent abuse

## Testing Strategy

### Backend Tests
- Friend request workflow (send, accept, decline)
- Friend removal
- Duplicate request prevention
- Wishlist sharing permissions
- Friend group management
- Search functionality

### Frontend Tests
- Friend list display
- Friend request notifications
- Share modal functionality
- Friend group filtering
- Shared wishlist access

### Integration Tests
- End-to-end friend request flow
- Wishlist sharing and access
- Notification delivery
- Permission enforcement

## Migration Strategy

No data migration needed - this is purely additive:
- New Friend collection will be created
- Existing wishlists will have empty `sharedWith` arrays by default
- No breaking changes to existing functionality

## Success Metrics

- [ ] Users can successfully send and accept friend requests
- [ ] Private wishlists can be shared with specific friends
- [ ] Friends can view shared private wishlists
- [ ] Friend groups work for organizing and bulk sharing
- [ ] Notifications work for friend requests and shares
- [ ] All tests passing
- [ ] Documentation updated

## Next Steps

1. Review and approve this plan
2. Start with Phase 2.1: Friend Management
3. Implement backend endpoints first
4. Build frontend UI
5. Add tests
6. Deploy and test

---

**Note**: This is a living document and will be updated as implementation progresses.
