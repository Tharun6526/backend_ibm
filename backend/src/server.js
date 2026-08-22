import app from './app.js';
import { env } from './config/environment.js';
import prisma from './config/database.js';

const PORT = env.PORT;

const server = app.listen(PORT, async () => {
  console.log(`==================================================`);
  console.log(`  AI CAREER COPILOT BACKEND SERVER IS RUNNING`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Environment: ${env.NODE_ENV}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);

  try {
    await prisma.$connect();
    console.log('Database connected successfully via Prisma Client');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
});

const gracefulShutdown = async () => {
  console.log('\nShutting down server gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Process exited.');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
