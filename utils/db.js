const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      maxPoolSize: 10, // Increase connection pool for better performance
      serverSelectionTimeoutMS: 10000, // Wait 10 seconds before timing out
    };

    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/phildpa';
    
    console.log(`Connecting to MongoDB: ${dbUri.substring(0, dbUri.indexOf('@') > 0 
      ? dbUri.indexOf('@') 
      : 10)}...`);
      
    cached.promise = mongoose.connect(dbUri, opts)
      .then(mongoose => {
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
        throw err;
      });

    // Handle MongoDB connection errors
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    // Listen for Node process termination and close the connection
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;