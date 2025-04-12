import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Connection state
let isConnected = false;

/**
 * Connect to MongoDB
 */
async function connectDB() {
  // If already connected, return
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI);
    
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully');
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectDB; 