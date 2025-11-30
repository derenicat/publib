import mongoose from 'mongoose';
import config from './env.js'; // Merkezi config dosyasını import et

const connectDB = async () => {
  try {
    const DB = config.DATABASE_URL.replace(
      '<PASSWORD>',
      config.DATABASE_PASSWORD
    );

    const conn = await mongoose.connect(DB);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
