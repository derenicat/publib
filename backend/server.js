// =================================================================
// UNCAUGHT EXCEPTION HANDLER
// Note: It is critical that this handler is BEFORE all other code.
// =================================================================
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error('Error:', err.name, err.message);
  console.error('Stack:', err.stack);
  // 1 stands for uncaught exception
  process.exit(1);
});

import app from './app.js';
import connectDB from './src/config/db.js';
import config from './src/config/env.js';

const port = config.PORT || 3000;

let server;

const startServer = async () => {
  try {
    // First, connect to the database
    await connectDB();

    // Only start the server if the DB connection is successful
    server = app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// =================================================================
// UNHANDLED REJECTION HANDLER
// =================================================================
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error('Error:', err.name, err.message);

  // Gracefully shut down the server (wait for current requests to finish)
  if (server) {
    server.close(() => {
      // 1 stands for uncaught exception
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
