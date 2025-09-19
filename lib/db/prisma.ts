import { PrismaClient } from '@prisma/client'

// Ensure DATABASE_URL/DIRECT_URL exist at runtime on Vercel.
// Falls back to SUPABASE_DB_URL if provided by the environment.
function ensureDbEnv() {
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
}

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

// Lazy initialize Prisma client
function getPrismaClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  // Only initialize if we have a database URL
  if (!process.env.DATABASE_URL && !process.env.SUPABASE_DB_URL) {
    throw new Error('DATABASE_URL or SUPABASE_DB_URL must be provided')
  }

  ensureDbEnv()
  
  const client = new PrismaClient()
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }
  
  return client
}

// Export a getter function instead of the client directly
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient()
    return (client as any)[prop]
  }
})

