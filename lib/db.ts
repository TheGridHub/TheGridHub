// Database connection placeholder
// In production, this would connect to your actual database

export const db = {
  user: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => null,
    update: async () => null,
  },
  subscription: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => null,
    update: async () => null,
  },
  payment: {
    findMany: async () => [],
    create: async () => null,
  }
}

export default db
