import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, ilike, or, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const DEFAULT_PASSWORD = 'Umrava26'

async function getAdminSession() {
  const session = await auth()
  return session?.user?.isAdmin === true ? session : null
}

type UserCols = {
  id: string
  fullName: string | null
  email: string
  phone: string | null
  plan: string | null
  city: string | null
  departureDate: string | null
  createdAt: Date | null
  premiumActivatedAt: Date | null
  isAdmin: boolean | null
}

function toRow(u: UserCols) {
  return {
    id: u.id,
    full_name: u.fullName,
    email: u.email,
    phone: u.phone,
    plan: u.plan,
    city: u.city,
    departure_date: u.departureDate,
    created_at: u.createdAt,
    premium_activated_at: u.premiumActivatedAt,
    is_admin: u.isAdmin,
  }
}

export async function GET(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const search = searchParams.get('search') ?? ''
  const plan = searchParams.get('plan') ?? ''
  const offset = (page - 1) * limit

  const cols = {
    id: users.id, fullName: users.fullName, email: users.email, phone: users.phone, plan: users.plan,
    city: users.city, departureDate: users.departureDate, createdAt: users.createdAt,
    premiumActivatedAt: users.premiumActivatedAt, isAdmin: users.isAdmin,
  }

  let query = db.select(cols).from(users).$dynamic()
  let countQuery = db.select({ total: sql<number>`count(*)` }).from(users).$dynamic()

  if (search && plan) {
    const cond = sql`(${ilike(users.fullName, `%${search}%`)} or ${ilike(users.email, `%${search}%`)}) and ${eq(users.plan, plan)}`
    query = query.where(cond) as typeof query
    countQuery = countQuery.where(cond) as typeof countQuery
  } else if (search) {
    const cond = or(ilike(users.fullName, `%${search}%`), ilike(users.email, `%${search}%`))!
    query = query.where(cond) as typeof query
    countQuery = countQuery.where(cond) as typeof countQuery
  } else if (plan) {
    query = query.where(eq(users.plan, plan)) as typeof query
    countQuery = countQuery.where(eq(users.plan, plan)) as typeof countQuery
  }

  const [rows, [{ total }]] = await Promise.all([
    query.orderBy(sql`${users.createdAt} desc`).limit(limit).offset(offset),
    countQuery,
  ])

  return NextResponse.json({ users: rows.map(toRow), total: Number(total), page, limit })
}

export async function PATCH(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { userId, plan, is_admin, action } = body

  if (action === 'reset_password') {
    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10)
    await db.update(users).set({ password: hashed, updatedAt: new Date() }).where(eq(users.id, userId))
    return NextResponse.json({ ok: true })
  }

  const updates: Partial<typeof users.$inferInsert> = {}
  if (plan !== undefined) {
    updates.plan = plan
    if (plan === 'premium') updates.premiumActivatedAt = new Date()
  }
  if (is_admin !== undefined) updates.isAdmin = is_admin
  if (Object.keys(updates).length > 0) {
    updates.updatedAt = new Date()
    await db.update(users).set(updates).where(eq(users.id, userId))
  }

  const [updated] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  return NextResponse.json({ ok: true, user: updated ? toRow(updated) : null })
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 })

  // Cegah admin hapus akun sendiri
  if (session.user?.id === userId) {
    return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri' }, { status: 400 })
  }

  await db.delete(users).where(eq(users.id, userId))
  return NextResponse.json({ ok: true })
}
