# Frontend Testing Guide

## Current State

The frontend is ready for initial testing! Here's what's been implemented and can be tested:

### ✅ Ready to Test

1. **Authentication Flow**
   - User registration
   - User login
   - Token persistence
   - Protected routes
   - Logout functionality

2. **Dashboard**
   - Stats display (contacts count, wishlist items)
   - Quick action buttons
   - Wishlist sharing link
   - Copy to clipboard functionality

3. **Navigation**
   - Responsive navigation bar
   - Mobile menu
   - Route protection
   - User profile menu

## 🧪 Manual Testing Steps

### Prerequisites

1. **Start the Backend Server**
   ```bash
   cd server
   
   # Create .env file if not exists
   cp .env.example .env
   
   # Start MongoDB (if using local MongoDB)
   # mongod
   
   # Start the server
   npm run dev
   ```

2. **Start the Frontend**
   ```bash
   cd client
   
   # Create .env file if not exists
   cp .env.example .env
   
   # Start the React app
   npm start
   ```

   The app should open at `http://localhost:3000`

### Test Scenarios

#### 1. Registration Flow
- [ ] Navigate to `http://localhost:3000/register`
- [ ] Try to register with invalid data (should show validation errors)
- [ ] Register with valid data:
  - Name: "Test User"
  - Email: "test@example.com"
  - Password: "password123"
  - Confirm Password: "password123"
- [ ] Should redirect to Dashboard after successful registration
- [ ] Check that user name appears in navigation

#### 2. Login Flow
- [ ] Logout from the current session
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Try to login with wrong credentials (should show error)
- [ ] Login with correct credentials
- [ ] Should redirect to Dashboard
- [ ] Verify token is stored in localStorage

#### 3. Protected Routes
- [ ] While logged out, try to access `http://localhost:3000/`
- [ ] Should redirect to `/login`
- [ ] After login, should be able to access protected routes

#### 4. Dashboard
- [ ] Check that stats are displayed correctly
- [ ] Verify contact count shows 0 (no contacts yet)
- [ ] Verify wishlist count shows 0 (no items yet)
- [ ] Click "Add Contact" button - should navigate to `/contacts`
- [ ] Click "Add Wishlist Item" button - should navigate to `/wishlist`

#### 5. Navigation
- [ ] Test navigation between pages
- [ ] Test mobile menu (resize browser to mobile width)
- [ ] Test logout functionality
- [ ] Verify user is redirected to login after logout

#### 6. Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify navigation adapts to screen size

## 🔍 Using Chrome DevTools MCP for Testing

You can use the Chrome DevTools MCP for automated testing:

### Performance Testing
```
@mcp:chrome-devtools: test http://localhost:3000 performance
```

### Take Screenshots
```
@mcp:chrome-devtools: screenshot http://localhost:3000/login
@mcp:chrome-devtools: screenshot http://localhost:3000/register
@mcp:chrome-devtools: screenshot http://localhost:3000/
```

### Test Form Interactions
```
@mcp:chrome-devtools: navigate to http://localhost:3000/login and fill form
```

### Monitor Network Requests
```
@mcp:chrome-devtools: list network requests for http://localhost:3000
```

### Check Console Errors
```
@mcp:chrome-devtools: list console messages for http://localhost:3000
```

## ⚠️ Known Limitations

### Not Yet Implemented
- **Contacts Page**: Only placeholder, CRUD operations not implemented
- **Wishlist Page**: Only placeholder, CRUD operations not implemented
- **Public Wishlist**: Only placeholder, viewing and reservation not implemented
- **Toast Notifications**: Success/error messages not yet implemented
- **Form Validation**: Basic validation only, could be enhanced
- **Loading States**: Some loading states missing
- **Error Boundaries**: Not yet implemented

### TypeScript Warnings
- `react-query` type declarations missing (doesn't affect functionality)
- Some Chakra UI v2 type warnings (cosmetic only)

## 🐛 Expected Issues

1. **API Connection**: If backend is not running, you'll see network errors
2. **CORS**: Make sure backend CORS is configured to allow `http://localhost:3000`
3. **MongoDB**: Backend requires MongoDB connection
4. **Placeholder Pages**: Contacts, Wishlist, and PublicWishlist show "Coming soon" messages

## ✅ What Works

- ✅ User registration with validation
- ✅ User login with error handling
- ✅ Token-based authentication
- ✅ Protected routes
- ✅ Dashboard with stats (when data is available)
- ✅ Responsive navigation
- ✅ Logout functionality
- ✅ Theme and styling
- ✅ Routing between pages

## 📝 Testing Checklist

### Authentication
- [ ] Can register new user
- [ ] Can login with existing user
- [ ] Invalid credentials show error
- [ ] Token persists on page refresh
- [ ] Protected routes redirect to login when not authenticated
- [ ] Can logout successfully

### UI/UX
- [ ] Pages load without errors
- [ ] Navigation works correctly
- [ ] Mobile menu works on small screens
- [ ] Forms are user-friendly
- [ ] Error messages are clear
- [ ] Loading states are visible

### Performance
- [ ] Pages load quickly
- [ ] No console errors
- [ ] Network requests are efficient
- [ ] Images/assets load properly

## 🚀 Next Steps After Testing

Based on test results:
1. Fix any bugs discovered
2. Implement Contacts page with full CRUD
3. Implement Wishlist page with full CRUD
4. Implement Public Wishlist page
5. Add toast notifications
6. Enhance form validation
7. Add loading states
8. Implement error boundaries

## 📊 Test Results Template

```markdown
## Test Session: [Date]

### Environment
- Backend: Running/Not Running
- Frontend: Running/Not Running
- Browser: Chrome/Firefox/Safari
- Screen Size: Desktop/Tablet/Mobile

### Results
- Registration: ✅/❌
- Login: ✅/❌
- Protected Routes: ✅/❌
- Dashboard: ✅/❌
- Navigation: ✅/❌
- Responsive Design: ✅/❌

### Issues Found
1. [Issue description]
2. [Issue description]

### Notes
[Any additional observations]
```
