const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/testdb";

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error("Set MONGO_URI in .env or make sure local MongoDB is running on 127.0.0.1:27017.");
    process.exit(1);
  }
};

module.exports = connectDB;
