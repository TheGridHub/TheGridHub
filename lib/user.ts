import prisma from '@/lib/prisma'
import type { User } from '@supabase/supabase-js'

export async function getOrCreateUser(supabaseUser: User | null) {
  if (!supabaseUser || !supabaseUser.email) {
    return null
  }

  // Try to find user by supabaseId first
  let user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id }
  })

  if (user) {
    return user
  }

  // If not found by supabaseId, try by email (migration path)
  user = await prisma.user.findUnique({
    where: { email: supabaseUser.email }
  })

  if (user) {
    // Update user with supabaseId if found by email
    return await prisma.user.update({
      where: { id: user.id },
      data: { supabaseId: supabaseUser.id }
    })
  }

  // Create new user if not found
  const metadata = supabaseUser.user_metadata || {}
  return await prisma.user.create({
    data: {
      supabaseId: supabaseUser.id,
      email: supabaseUser.email,
      name: metadata.full_name || metadata.first_name || supabaseUser.email.split('@')[0],
      avatar: metadata.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(metadata.full_name || supabaseUser.email)}&background=0D9488&color=fff`
    }
  })
}
