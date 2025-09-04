import prisma from './prisma'

// Thin wrapper so existing imports continue to work
export const db = prisma

export default prisma

