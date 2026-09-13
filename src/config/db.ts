import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

//penyimpanan ke objek global hanya dilakukan saat mode pengembangan (development)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
