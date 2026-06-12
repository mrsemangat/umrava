import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export async function GET() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  if (session.user.isAdmin) redirect('/admin')

  try {
    const [profile] = await db.select({ createdAt: users.createdAt })
      .from(users).where(eq(users.id, session.user.id)).limit(1)

    // User baru via Google OAuth: created_at dalam 2 menit terakhir
    const isNewUser = profile?.createdAt &&
      Date.now() - new Date(profile.createdAt).getTime() < 120_000

    redirect(isNewUser ? '/dashboard?welcome=1' : '/dashboard')
  } catch {
    redirect('/dashboard')
  }
}
