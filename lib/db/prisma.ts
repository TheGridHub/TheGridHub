import { PrismaClient } from '@prisma/client'

// Ensure DATABASE_URL/DIRECT_URL exist at runtime on Vercel.
// Falls back to SUPABASE_DB_URL if provided by the environment.
(function ensureDbEnv() {
  const hasDb = !!process.env.DATABASE_URL
  const supaDb = process.env.SUPABASE_DB_URL
  if (!hasDb && supaDb) {
    let url = supaDb
    if (!/sslmode=/.test(url)) {
      url += (url.includes('?') ? '&' : '?') + 'sslmode=require'
    }
    process.env.DATABASE_URL = url
    if (!process.env.DIRECT_URL) process.env.DIRECT_URL = url
  }
})()

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

