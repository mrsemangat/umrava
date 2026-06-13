import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sendEmail } from '@/lib/mailketing'
import { buildWelcomeEmail } from '@/lib/emailTemplates'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { name, email, password, phone } = await req.json().catch(() => ({}))

  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan password diperlukan' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
  }

  // Cek email sudah ada
  const existing = await db.select({ id: users.id }).from(users)
    .where(eq(users.email, email)).limit(1)
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Email sudah terdaftar, silakan login' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const nama = name || email.split('@')[0]

  await db.insert(users).values({
    email,
    password: hashed,
    name: nama,
    fullName: nama,
    phone: phone || null,
    plan: 'free',
    isAdmin: false,
  })

  // Welcome email (fire-and-forget)
  sendEmail(buildWelcomeEmail({ nama_user: nama.split(' ')[0], email })).catch(() => {})

  return NextResponse.json({ ok: true })
}
