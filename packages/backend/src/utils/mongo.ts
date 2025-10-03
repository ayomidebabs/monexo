import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

// Define the type for the global variable to store the MongoClient promise
declare global {
  var _mongoPromise: Promise<MongoClient> | undefined;
}

// Get the Mongo URI from environment variables
const uri = process.env.MONGO_URI;

console.log(uri);
// Validate the Mongo URI
if (!uri || typeof uri !== 'string') {
  throw new Error('Please add a valid Mongo URI to .env');
}

// Initialize clientPromise with proper type
let clientPromise: Promise<MongoClient>;

// Check environment and handle connection
if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve the connection across hot reloads
  if (!global._mongoPromise) {
    const client = new MongoClient(uri);
    global._mongoPromise = client.connect();
  }
  clientPromise = global._mongoPromise;
} else {
  // In production, create a new connection
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
