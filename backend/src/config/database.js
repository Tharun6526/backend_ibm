import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from './environment.js';

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      adapter,
      log: ['query', 'error', 'warn']
    });
  }
  prisma = global.__prisma;
}

export default prisma;
