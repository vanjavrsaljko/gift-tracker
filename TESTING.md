# Testing Documentation

## Overview

This document describes the testing strategy and implementation for the Gift Tracker application.

## Backend Tests

### Test Infrastructure

- **Framework**: Jest with ts-jest for TypeScript support
- **HTTP Testing**: Supertest for API endpoint testing
- **Database**: MongoDB Memory Server for isolated test database
- **Coverage**: Configured to generate coverage reports

### Test Structure

```
server/src/__tests__/
├── setup.ts                    # Global test setup and teardown
├── testApp.ts                  # Test application instance
├── unit/                       # Unit tests
│   └── User.test.ts           # User model tests
└── integration/                # Integration tests
    ├── auth.test.ts           # Authentication API tests
    ├── contacts.test.ts       # Contacts API tests
    └── wishlist.test.ts       # Wishlist API tests
```

### Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Test Coverage

Current test coverage includes:

#### Unit Tests (User Model)
- ✅ Password hashing before saving
- ✅ Password not rehashed if not modified
- ✅ Password matching (correct and incorrect)
- ✅ Schema validation (required fields)
- ✅ Unique email enforcement
- ✅ Contacts management
- ✅ Gift ideas for contacts
- ✅ Wishlist management
- ✅ Wishlist item reservation

#### Integration Tests (Authentication API)
- ✅ User registration with valid data
- ✅ Duplicate email prevention
- ✅ Required field validation
- ✅ Login with correct credentials
- ✅ Login failure with incorrect password
- ✅ Login failure with non-existent email
- ✅ Get profile with valid token
- ✅ Profile access denied without token
- ✅ Profile access denied with invalid token
- ✅ Update user profile
- ✅ Update password

#### Integration Tests (Contacts API)
- ✅ Add new contact
- ✅ Authentication required for adding contacts
- ✅ Get all contacts for authenticated user
- ✅ Authentication required for getting contacts
- ✅ Get contact by ID
- ✅ 404 for non-existent contact
- ✅ Update contact
- ✅ Delete contact
- ✅ Add gift idea to contact
- ✅ Toggle gift idea purchased status

#### Integration Tests (Wishlist API)
- ✅ Add new wishlist item
- ✅ Authentication required for adding items
- ✅ Get user's wishlist
- ✅ Authentication required for getting wishlist
- ✅ Get public wishlist without authentication
- ✅ Reserved items hidden in public wishlist
- ✅ 404 for non-existent user's public wishlist
- ✅ Update wishlist item
- ✅ Reserve available wishlist item
- ✅ Cannot reserve already reserved item
- ✅ Reservation works without authentication
- ✅ Delete wishlist item
- ✅ Authentication required for deleting items

### Test Statistics

- **Total Tests**: 47
- **Passing**: 47
- **Code Coverage**: ~78% overall
  - Controllers: 75-82%
  - Models: 100%
  - Routes: 100%
  - Middleware: 100%

### Test Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Clean State**: Database is cleared after each test
3. **Realistic Data**: Tests use realistic user data and scenarios
4. **Error Cases**: Both success and failure scenarios are tested
5. **Authentication**: Protected routes are tested with and without tokens

## Frontend Tests (To Be Implemented)

### Planned Test Infrastructure

- **Framework**: Jest with React Testing Library
- **Component Testing**: Testing Library for React components
- **E2E Testing**: Chrome DevTools MCP for browser automation and testing
- **Performance Testing**: Chrome DevTools MCP for Core Web Vitals and performance insights

### Chrome DevTools MCP Integration

The Chrome DevTools MCP server provides powerful browser automation and testing capabilities:

**Available Features:**
- 🌐 **Browser Automation**: Navigate pages, click elements, fill forms
- 📸 **Screenshots**: Capture full page or element screenshots
- 🎯 **Element Interaction**: Click, hover, drag, and fill elements
- 📊 **Performance Tracing**: Record and analyze performance with Core Web Vitals
- 🔍 **Network Monitoring**: Inspect network requests and responses
- 📝 **Console Logs**: Access browser console messages
- 🧪 **A11y Tree Snapshots**: Test accessibility

**Example Usage:**
```bash
# Test performance of the application
@mcp:chrome-devtools: test http://localhost:3000 performance

# Take screenshots for visual regression testing
@mcp:chrome-devtools: screenshot http://localhost:3000/contacts

# Test form interactions
@mcp:chrome-devtools: navigate to login page and fill form

# Monitor network requests
@mcp:chrome-devtools: list network requests for wishlist page
```

### Planned Test Coverage

#### Component Tests
- [ ] Login form validation and submission
- [ ] Registration form validation
- [ ] Contact list rendering and filtering
- [ ] Contact form (add/edit)
- [ ] Wishlist item form
- [ ] Public wishlist view
- [ ] Navigation and routing

#### Integration Tests
- [ ] Authentication flow
- [ ] Contact CRUD operations
- [ ] Wishlist CRUD operations
- [ ] Public wishlist sharing

#### E2E Tests (Using Chrome DevTools MCP)
- [ ] Complete user journey: register → login → add contacts → add wishlist
- [ ] Public wishlist viewing and reservation
- [ ] Responsive design on different devices
- [ ] Form validation and error handling
- [ ] Navigation and routing flows

#### Performance Tests (Using Chrome DevTools MCP)
- [ ] Page load times and Core Web Vitals (LCP, FID, CLS)
- [ ] Performance insights and bottlenecks
- [ ] Network request optimization
- [ ] Bundle size analysis

## Continuous Integration

### Recommended CI/CD Setup

```yaml
# Example GitHub Actions workflow
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd server && npm install
      - run: cd server && npm test
      - uses: codecov/codecov-action@v2
        with:
          files: ./server/coverage/lcov.info
```

## Manual Testing Checklist

### Authentication
- [ ] Register new user
- [ ] Login with correct credentials
- [ ] Login fails with wrong password
- [ ] Protected routes require authentication
- [ ] Token persists across page refreshes

### Contacts Management
- [ ] Add new contact
- [ ] View all contacts
- [ ] Edit contact details
- [ ] Delete contact
- [ ] Add interests to contact
- [ ] Add gift ideas to contact
- [ ] Mark gift ideas as purchased

### Wishlist Management
- [ ] Add wishlist item
- [ ] Edit wishlist item
- [ ] Delete wishlist item
- [ ] View own wishlist
- [ ] Share wishlist link
- [ ] View public wishlist
- [ ] Reserve item anonymously
- [ ] Reserved items hidden from public view

## Known Issues and Limitations

1. **Test Database**: Using MongoDB Memory Server which may have slight differences from production MongoDB
2. **Email Testing**: Email notifications not yet implemented or tested
3. **File Uploads**: Image upload functionality not yet tested
4. **Performance**: Load testing not yet implemented

## Future Testing Improvements

1. **Increase Coverage**: Aim for 90%+ code coverage
2. **Performance Tests**: Add load testing with tools like k6 or Artillery
3. **Security Tests**: Add security-focused tests (SQL injection, XSS, etc.)
4. **Accessibility Tests**: Add a11y testing with jest-axe
5. **Visual Regression**: Add visual regression testing with Percy or Chromatic
6. **API Contract Testing**: Add contract tests with Pact
7. **Mutation Testing**: Add mutation testing with Stryker

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all tests pass before committing
3. Maintain or improve code coverage
4. Update this documentation with new test cases
5. Follow existing test patterns and conventions
