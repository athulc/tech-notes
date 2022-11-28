import mongoose from "mongoose";

export const connectDB = () => {
  try {
    mongoose.connect(process.env.DATABASE_URI);
  } catch (err) {
    console.error(err);
  }
};
