import express from 'express';
import cors from 'cors';
import userRoutes from '../routes/userRoutes';
import contactRoutes from '../routes/contactRoutes';
import wishlistRoutes from '../routes/wishlistRoutes';
import friendRoutes from '../routes/friendRoutes';

const createTestApp = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/users', userRoutes);
  app.use('/api/contacts', contactRoutes);
  app.use('/api/wishlists', wishlistRoutes);
  app.use('/api/friends', friendRoutes);

  return app;
};

export default createTestApp;
