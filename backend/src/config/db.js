import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const DB = process.env.DATABASE_URL.replace(
      '<PASSWORD>',
      process.env.DATABASE_PASSWORD
    );

    const conn = await mongoose.connect(DB);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;


