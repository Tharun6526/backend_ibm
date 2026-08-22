import { PrismaClient } from '@prisma/client';
import { env } from './environment.js';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn']
    });
  }
  prisma = global.__prisma;
}

export default prisma;
