const env = require('./env');
const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = env.MONGO_URI;

  try {
    await mongoose.connect(mongoUri);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error("Set MONGO_URI in .env or make sure local MongoDB is running on 127.0.0.1:27017.");
    process.exit(1);
  }
};

module.exports = connectDB;
