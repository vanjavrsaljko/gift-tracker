# Gift Tracker PWA

Track contacts' interests, manage gift ideas, and share wishlists with anonymous reservations.

## ✅ Status: FULLY FUNCTIONAL

### Backend (Node.js/Express/MongoDB)
- JWT authentication with bcrypt
- Contact CRUD with interests and gift ideas (edit/delete gift ideas)
- **Contact-Friend Integration**: Link contacts to friends with auto-linking
- **Multi-Wishlist System**: Multiple wishlists per user with visibility controls
- **Friend System**: Friend requests, management, and private wishlist sharing
- Public/Private wishlist sharing with anonymous reservations
- 59 passing tests (~78% coverage)

### Frontend (React/TypeScript/Chakra UI v2)
- **Authentication**: Login, Register, Protected Routes
- **Dashboard**: Aggregated stats across all wishlists, shareable link
- **Contacts**: Full CRUD, interests tags, gift ideas, link to friends, suggestions banner
- **Friends**: Friend requests, management, view contact notes, create contacts
- **Wishlist**: Multiple wishlists with tabs, visibility toggle (Public/Private), full item CRUD
- **Public Wishlist**: Multiple public wishlists grouped by name, anonymous reservation, contact notes
- **Contact-Friend Integration**: Smart auto-linking, manual linking, bidirectional navigation
- All features tested and working

## 🎉 Recent Updates

### Contact-Friend Integration ✅ COMPLETE (November 3, 2025)

A comprehensive feature connecting Contacts and Friends systems with smart auto-linking:

**Smart Auto-Linking:**
- ✅ **Email-Based Auto-Link**: Automatically links contacts to friends when email matches
- ✅ **Link Suggestions Banner**: Shows email-matched contacts with quick "Link Now" buttons
- ✅ **Auto-Link on Friend Accept**: Detects email match and links automatically
- ✅ **Enhanced Notifications**: Success toasts show which contact was linked

**Manual Workflows:**
- ✅ **Link to Friend**: Select from friend list to link existing contact
- ✅ **Create Contact from Friend**: Pre-filled form with friend's info, auto-links after creation
- ✅ **Conditional Buttons**: "View Contact Notes" (linked) or "Create Contact" (unlinked)
- ✅ **Manual Link Modal**: Fallback when no email match on friend accept

**Data Display:**
- ✅ **Contact Notes on Friends Page**: Modal showing interests and gift ideas
- ✅ **Contact Notes on Wishlist Page**: Purple section while browsing friend's wishlist
- ✅ **Read-Only Display**: Encourages editing from Contacts page
- ✅ **Empty States**: Graceful handling when no contact data

**Technical Implementation:**
- ✅ **4 New API Endpoints**: link, unlink, suggestions, contact-data
- ✅ **24 Integration Tests**: Complete test coverage for linking workflows
- ✅ **Migration 003**: Backward compatibility for existing data
- ✅ **Privacy-Conscious**: Only shares interests/gift ideas, not personal info

📖 **See [CONTACT_FRIEND_INTEGRATION_PLAN.md](CONTACT_FRIEND_INTEGRATION_PLAN.md) for complete documentation**

### Phase 2: Friend System ✅ COMPLETE

**Phase 2.1: Friend Management ✅**
- ✅ Send/receive friend requests with badge notifications
- ✅ Accept/decline requests, remove friends
- ✅ Bidirectional friendships with real-time updates

**Phase 2.3: Private Wishlist Sharing ✅**
- ✅ Share private wishlists with specific friends
- ✅ Multi-select friend cards with share count
- ✅ "Shared with you" badge on shared wishlists

### Multi-Wishlist Feature (Completed)
Users can now create and manage multiple wishlists with different visibility settings:
- ✅ **Multiple Named Wishlists**: Create wishlists for different occasions (Christmas, Wedding, Birthday, etc.)
- ✅ **Visibility Controls**: Set each wishlist as Public (anyone with link) or Private (friends only - Phase 2)
- ✅ **Tabbed Interface**: Easy navigation between wishlists with visual badges
- ✅ **Grouped Public View**: Public wishlists displayed by name on shared link
- ✅ **Per-Wishlist Stats**: Track items, reserved count, and total value per wishlist
- ✅ **Data Migration**: Existing wishlist data automatically migrated

See [PHASE2_FRIEND_SYSTEM.md](PHASE2_FRIEND_SYSTEM.md) and [FRONTEND_PROGRESS.md](FRONTEND_PROGRESS.md) for detailed implementation notes.

## 🏗️ Project Structure

```
gift-tracker/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Request handlers
│   │   │   ├── userController.ts
│   │   │   ├── contactController.ts
│   │   │   └── wishlistController.ts
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   └── server.ts      # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
└── client/                # Frontend React app
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── context/       # React context providers
    │   ├── hooks/         # Custom React hooks
    │   ├── pages/         # Page components
    │   ├── services/      # API service layer
    │   ├── theme/         # Chakra UI theme
    │   ├── types/         # TypeScript types
    │   ├── utils/         # Utility functions
    │   └── App.tsx        # Main app component
    ├── package.json
    └── tsconfig.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/users` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Contacts
- `GET /api/contacts` - Get all contacts (protected)
- `POST /api/contacts` - Add new contact (protected)
- `GET /api/contacts/:id` - Get contact by ID (protected)
- `PUT /api/contacts/:id` - Update contact (protected)
- `DELETE /api/contacts/:id` - Delete contact (protected)
- `POST /api/contacts/:id/gift-ideas` - Add gift idea to contact (protected)
- `PUT /api/contacts/:contactId/gift-ideas/:giftIdeaId` - Toggle gift idea purchased status (protected)
- `POST /api/contacts/:contactId/link/:friendId` - Link contact to friend (protected)
- `DELETE /api/contacts/:contactId/link` - Unlink contact from friend (protected)
- `GET /api/contacts/link-suggestions` - Get email-matched link suggestions (protected)

### Friends
- `GET /api/friends` - Get all friends (protected)
- `GET /api/friends/requests` - Get friend requests (protected)
- `POST /api/friends/request` - Send friend request (protected)
- `PUT /api/friends/:id/accept` - Accept friend request (protected)
- `PUT /api/friends/:id/decline` - Decline friend request (protected)
- `DELETE /api/friends/:id` - Remove friend (protected)
- `GET /api/friends/search` - Search users by email (protected)
- `GET /api/friends/:friendId/contact-data` - Get linked contact data (protected)

### Wishlist
- `GET /api/wishlist` - Get user's wishlist (protected)
- `POST /api/wishlist` - Add wishlist item (protected)
- `PUT /api/wishlist/:id` - Update wishlist item (protected)
- `DELETE /api/wishlist/:id` - Delete wishlist item (protected)
- `GET /api/wishlist/public/:userId` - Get public wishlist (public)
- `PUT /api/wishlist/:id/reserve` - Reserve wishlist item (public)

## 🗄️ Data Models

### User
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  wishlist: Array<WishlistItem>
  contacts: Array<Contact>
  timestamps: true
}
```

### Contact (embedded in User)
```typescript
{
  name: string
  email?: string
  phone?: string
  notes?: string
  interests: string[]
  giftIdeas: Array<GiftIdea>
  linkedUserId?: ObjectId  // Link to friend user
  linkedAt?: Date
}
```

### WishlistItem (embedded in User)
```typescript
{
  name: string
  description?: string
  link?: string
  price?: number
  reserved: boolean
  reservedBy?: ObjectId
}
```

## 🚀 Getting Started

### Development Setup

#### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

#### Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
MONGODB_URI=mongodb://localhost:27017/gifttracker
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

Start the server:
```bash
npm run dev
```

#### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Production Deployment

For production deployment to AWS EC2 with CI/CD, see **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete instructions including:

- 🐳 Docker setup
- 🔄 CI/CD with GitHub Actions
- 🗄️ Database migrations
- 🔐 Security configuration
- 📊 Monitoring and troubleshooting

## 🧪 Testing

The backend has comprehensive test coverage with **59 passing tests** (~78% coverage) using Jest, Supertest, and MongoDB Memory Server.

**Test Coverage:**
- ✅ Unit tests for User model
- ✅ Integration tests for Authentication API
- ✅ Integration tests for Contacts API
- ✅ Integration tests for Wishlist API
- ✅ Integration tests for Friend System
- ✅ Integration tests for Contact-Friend Linking (24 tests)

**Running Tests:**
```bash
cd server
npm test              # Run all tests with coverage
npm run test:watch    # Watch mode
npm run test:unit     # Unit tests only
npm run test:integration  # Integration tests only
```

📖 **For detailed testing documentation, see [TESTING.md](TESTING.md) and [TEST_SUMMARY.md](TEST_SUMMARY.md)**

## 📝 Future Enhancements

### Potential Enhancements
- Friend groups/categories for granular sharing
- Notifications system for friend requests and reservations
- Activity feed showing friend updates

### Additional Features
- PWA features (service worker, offline support, install prompt)
- Image uploads for wishlist items
- Search/filter functionality for contacts and wishlists
- Email notifications for reservations
- Social sharing integrations
- Import/export data
- Wishlist templates

## 🛠️ Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- TypeScript
- JWT for authentication
- bcrypt for password hashing

### Frontend
- React 19
- TypeScript
- Chakra UI
- React Query
- React Router
- Axios

## 📄 License

MIT
