// db.js
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/SysEngLearn";

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB conectado");
  } catch (error) {
    console.error("Error al conectar MongoDB:", error);
  }
}

export default connectDB;
