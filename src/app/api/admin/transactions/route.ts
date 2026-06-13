import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { webhookLogs, users } from '@/lib/db/schema'
import { desc, eq, and, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getTransactionStatus } from '@/lib/duitku'
import { getDuitkuConfig } from '@/lib/paymentSettings'
import { sendEmail } from '@/lib/mailketing'
import { buildPremiumEmail } from '@/lib/emailTemplates'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

async function isAdmin() {
  const session = await auth()
  return session?.user?.isAdmin === true ? session : null
}

// GET: daftar semua transaksi (per orderId, status terbaru)
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Ambil semua log transaksi Duitku, urutkan terbaru dulu
  const logs = await db
    .select({
      id: webhookLogs.id,
      source: webhookLogs.source,
      event: webhookLogs.event,
      orderId: webhookLogs.orderId,
      buyerEmail: webhookLogs.buyerEmail,
      buyerName: webhookLogs.buyerName,
      amount: webhookLogs.amount,
      status: webhookLogs.status,
      userId: webhookLogs.userId,
      userUpgraded: webhookLogs.userUpgraded,
      error: webhookLogs.error,
      createdAt: webhookLogs.createdAt,
    })
    .from(webhookLogs)
    .where(eq(webhookLogs.source, 'duitku'))
    .orderBy(desc(webhookLogs.createdAt))

  // Group by orderId: satu baris per transaksi, ambil info paling lengkap
  const map = new Map<string, {
    orderId: string
    buyerEmail: string | null
    buyerName: string | null
    userId: string | null
    amount: number | null
    status: string
    userUpgraded: boolean
    createdAt: Date | null
    updatedAt: Date | null
    events: string[]
  }>()

  for (const log of logs) {
    if (!log.orderId) continue
    const existing = map.get(log.orderId)
    if (!existing) {
      map.set(log.orderId, {
        orderId: log.orderId,
        buyerEmail: log.buyerEmail,
        buyerName: log.buyerName,
        userId: log.userId,
        amount: log.amount,
        status: log.status ?? 'UNKNOWN',
        userUpgraded: log.userUpgraded ?? false,
        createdAt: log.createdAt,  // log terbaru = tanggal terbaru
        updatedAt: log.createdAt,
        events: [log.event ?? ''],
      })
    } else {
      // Sudah ada — ambil yang lebih informatif
      if (!existing.buyerEmail && log.buyerEmail) existing.buyerEmail = log.buyerEmail
      if (!existing.buyerName && log.buyerName) existing.buyerName = log.buyerName
      if (!existing.userId && log.userId) existing.userId = log.userId
      if (!existing.amount && log.amount) existing.amount = log.amount
      if (log.userUpgraded) existing.userUpgraded = true
      if (log.status === 'PAID' || log.status === 'UNPAID') existing.status = log.status
      // createdAt = tanggal log pertama (created transaction), ambil yang paling lama
      if (log.event === 'transaction.created' && log.createdAt) {
        existing.createdAt = log.createdAt
      }
      existing.events.push(log.event ?? '')
    }
  }

  // Resolve user plan untuk setiap transaksi
  const txList = Array.from(map.values())
  const userIds = [...new Set(txList.map(t => t.userId).filter(Boolean))] as string[]
  const userRows = userIds.length > 0
    ? await db.select({ id: users.id, plan: users.plan, fullName: users.fullName, email: users.email })
        .from(users).where(sql`${users.id} = ANY(${userIds})`)
    : []
  const userMap = new Map(userRows.map(u => [u.id, u]))

  const result = txList.map(tx => {
    const user = tx.userId ? userMap.get(tx.userId) : null
    return {
      ...tx,
      userPlan: user?.plan ?? null,
      userFullName: user?.fullName ?? tx.buyerName,
      userEmail: user?.email ?? tx.buyerEmail,
    }
  })

  // Sort: terbaru dulu (berdasarkan updatedAt)
  result.sort((a, b) => {
    const ta = a.updatedAt?.getTime() ?? 0
    const tb = b.updatedAt?.getTime() ?? 0
    return tb - ta
  })

  return NextResponse.json({ transactions: result })
}

// POST: cek & upgrade satu transaksi by orderId
export async function POST(req: NextRequest) {
  const session = await isAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { orderId } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'orderId diperlukan' }, { status: 400 })

  // Cari userId dari log
  const [txLog] = await db
    .select({ userId: webhookLogs.userId, buyerEmail: webhookLogs.buyerEmail, buyerName: webhookLogs.buyerName })
    .from(webhookLogs)
    .where(and(eq(webhookLogs.orderId, orderId), eq(webhookLogs.source, 'duitku')))
    .limit(1)

  if (!txLog?.userId) return NextResponse.json({ error: 'User tidak ditemukan untuk transaksi ini' }, { status: 404 })

  const userId = txLog.userId

  // Cek user plan
  const [profile] = await db
    .select({ plan: users.plan, fullName: users.fullName, email: users.email })
    .from(users).where(eq(users.id, userId)).limit(1)

  if (profile?.plan === 'premium') {
    return NextResponse.json({ ok: true, action: 'already_premium', message: 'User sudah premium' })
  }

  // Cek sudah pernah upgraded di log
  const [alreadyUpgraded] = await db
    .select({ id: webhookLogs.id })
    .from(webhookLogs)
    .where(and(eq(webhookLogs.orderId, orderId), eq(webhookLogs.userUpgraded, true)))
    .limit(1)

  if (alreadyUpgraded) {
    return NextResponse.json({ ok: true, action: 'already_logged', message: 'Sudah tercatat upgraded' })
  }

  // Cek status ke Duitku
  const cfg = await getDuitkuConfig()
  const result = await getTransactionStatus(orderId, cfg)

  if (result.statusCode !== '00') {
    return NextResponse.json({
      ok: false,
      action: 'not_paid',
      statusCode: result.statusCode,
      message: `Transaksi belum lunas (status Duitku: ${result.statusCode} — ${result.statusMessage})`,
    })
  }

  // Upgrade!
  await db.update(users).set({ plan: 'premium', premiumActivatedAt: new Date() }).where(eq(users.id, userId))

  await db.insert(webhookLogs).values({
    source: 'duitku',
    event: 'payment.paid.admin_check',
    orderId,
    amount: 49000,
    status: 'PAID',
    userId,
    buyerEmail: profile?.email || txLog.buyerEmail,
    buyerName: profile?.fullName || txLog.buyerName,
    userUpgraded: true,
    payload: { statusCode: result.statusCode, source: 'admin_manual_check', adminId: session.user?.id },
    error: null,
  })

  const emailAddr = profile?.email || txLog.buyerEmail || ''
  if (emailAddr) {
    sendEmail(buildPremiumEmail({
      nama_user: profile?.fullName || txLog.buyerName || 'Sahabat',
      email: emailAddr,
    })).catch(() => {})
  }

  console.log(`[Admin] Manual upgrade: ${profile?.email} (orderId: ${orderId}) by admin ${session.user?.id}`)

  return NextResponse.json({
    ok: true,
    action: 'upgraded',
    message: `${profile?.email || txLog.buyerEmail} berhasil di-upgrade ke Premium`,
  })
}
