# Gift Tracker PWA

Track contacts' interests, manage gift ideas, and share wishlists with anonymous reservations.

## ✅ Status: FULLY FUNCTIONAL

### Backend (Node.js/Express/MongoDB)
- JWT authentication with bcrypt
- Contact CRUD with interests and gift ideas (edit/delete gift ideas)
- **Multi-Wishlist System**: Multiple wishlists per user with visibility controls
- Public/Private wishlist sharing with anonymous reservations
- 47 passing tests (~78% coverage)

### Frontend (React/TypeScript/Chakra UI v2)
- **Authentication**: Login, Register, Protected Routes
- **Dashboard**: Aggregated stats across all wishlists, shareable link
- **Contacts**: Full CRUD, interests tags, gift ideas with edit/delete
- **Wishlist**: Multiple wishlists with tabs, visibility toggle (Public/Private), full item CRUD
- **Public Wishlist**: Multiple public wishlists grouped by name, anonymous reservation
- All features tested and working

## 🎉 Recent Updates

### Phase 2: Friend System (In Progress)

**Phase 2.1: Friend Management ✅ COMPLETE**
- ✅ **Send Friend Requests**: Search users by email and send friend requests
- ✅ **Receive Requests**: View pending friend requests with badge notifications
- ✅ **Accept/Decline**: Manage incoming friend requests
- ✅ **Friends List**: View all friends with email and friendship date
- ✅ **Remove Friends**: Remove friends with confirmation dialog
- ✅ **Bidirectional**: Friendship works both ways automatically
- ✅ **Real-time Updates**: Automatic refresh with React Query
- ✅ **Tested**: Full workflow verified with multiple users

**Coming Next: Phase 2.2 - Friend Groups**

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

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
MONGO_URI=mongodb://localhost:27017/gifttracker
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
```

Start the server:
```bash
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

## 🧪 Testing

The backend has comprehensive test coverage with **47 passing tests** (~78% coverage) using Jest, Supertest, and MongoDB Memory Server.

**Test Coverage:**
- ✅ Unit tests for User model
- ✅ Integration tests for Authentication API
- ✅ Integration tests for Contacts API
- ✅ Integration tests for Wishlist API

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

### Phase 2: Friend System (Next Priority)
- Friend relationship management (add/remove friends)
- Friend requests and acceptance workflow
- Private wishlist sharing with specific friends
- Friend groups/categories for granular sharing

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
