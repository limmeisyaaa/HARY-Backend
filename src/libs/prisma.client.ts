
import { PrismaNeon } from '@prisma/adapter-neon'
import { DATABASE_URL } from '../config/env.config'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaNeon({
  connectionString: DATABASE_URL,
})

export const prisma = new PrismaClient({ adapter })