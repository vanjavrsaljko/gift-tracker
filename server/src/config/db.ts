import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Only load .env file in development (production uses docker-compose env_file)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const connectDB = async () => {
  try {
    // Support both MONGODB_URI (production) and MONGO_URI (legacy)
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/gifttracker';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
};

export default connectDB;
