import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { webhookLogs, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { verifyCallbackSignature, extractUserIdPrefix } from '@/lib/duitku'
import { getDuitkuConfig } from '@/lib/paymentSettings'
import { sendEmail } from '@/lib/mailketing'
import { buildPremiumEmail } from '@/lib/emailTemplates'

export const dynamic = 'force-dynamic'

interface DuitkuCallbackPayload {
  merchantCode: string
  amount: string
  merchantOrderId: string
  productDetail: string
  additionalParam: string
  paymentCode: string
  resultCode: string   // "00" = success, "01" = pending
  merchantUserId: string
  reference: string
  signature: string
  publisherOrderId?: string
  settlementDate?: string
  issuerCode?: string
}

export async function POST(req: NextRequest) {
  let payload: DuitkuCallbackPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 })
  }

  const { merchantCode, amount, merchantOrderId, resultCode, reference, signature } = payload

  // Verifikasi signature
  const cfg = await getDuitkuConfig()
  if (!verifyCallbackSignature(cfg, merchantCode, amount, merchantOrderId, signature)) {
    console.error('[Duitku] Invalid callback signature for order:', merchantOrderId)
    return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 })
  }

  // Idempotency — jangan proses ulang
  const existing = await db.select({ id: webhookLogs.id })
    .from(webhookLogs)
    .where(and(eq(webhookLogs.orderId, merchantOrderId), eq(webhookLogs.userUpgraded, true)))
    .limit(1)

  if (existing.length > 0) {
    return NextResponse.json({ success: true, message: 'Already processed' })
  }

  const logBase = {
    source: 'duitku',
    event: `payment.${resultCode === '00' ? 'paid' : 'pending'}`,
    orderId: merchantOrderId,
    amount: parseInt(amount, 10),
    status: resultCode === '00' ? 'PAID' : 'PENDING',
    payload: payload as unknown as Record<string, unknown>,
    userUpgraded: false,
    error: null as string | null,
    userId: null as string | null,
    buyerEmail: null as string | null,
    buyerName: null as string | null,
  }

  // Hanya proses resultCode "00" (sukses)
  if (resultCode !== '00') {
    await db.insert(webhookLogs).values(logBase)
    return NextResponse.json({ success: true, message: `resultCode ${resultCode} tidak memerlukan aksi` })
  }

  // Cari user dari log pending yang dibuat saat create transaction
  let userId: string | null = null
  let userEmail: string | null = null
  let userName: string | null = null

  const [pendingLog] = await db.select({
    userId: webhookLogs.userId,
    buyerEmail: webhookLogs.buyerEmail,
    buyerName: webhookLogs.buyerName,
  }).from(webhookLogs)
    .where(and(eq(webhookLogs.orderId, merchantOrderId), eq(webhookLogs.source, 'duitku')))
    .limit(1)

  if (pendingLog?.userId) {
    userId = pendingLog.userId
    userEmail = pendingLog.buyerEmail
    userName = pendingLog.buyerName
  } else {
    // Fallback: cari dari prefix userId di merchantOrderId
    const prefix = extractUserIdPrefix(merchantOrderId)
    if (prefix) {
      const allProfiles = await db.select({ id: users.id, email: users.email, fullName: users.fullName })
        .from(users)
      const match = allProfiles.find(p => p.id.replace(/-/g, '').startsWith(prefix.replace(/-/g, '')))
      if (match) {
        userId = match.id
        userEmail = match.email
        userName = match.fullName
      }
    }
  }

  logBase.buyerEmail = userEmail
  logBase.buyerName = userName

  if (!userId) {
    logBase.error = `User tidak ditemukan untuk merchantOrderId: ${merchantOrderId}`
    await db.insert(webhookLogs).values(logBase)
    return NextResponse.json({ success: true, warning: logBase.error })
  }

  // Cek sudah premium
  const [profile] = await db.select({ plan: users.plan, fullName: users.fullName, email: users.email })
    .from(users).where(eq(users.id, userId)).limit(1)

  if (profile?.plan === 'premium') {
    logBase.userId = userId
    await db.insert(webhookLogs).values({ ...logBase, error: 'Sudah premium' })
    return NextResponse.json({ success: true, message: 'User sudah premium' })
  }

  // Upgrade ke Premium
  await db.update(users).set({ plan: 'premium', premiumActivatedAt: new Date() })
    .where(eq(users.id, userId))

  logBase.userUpgraded = true
  logBase.userId = userId
  await db.insert(webhookLogs).values(logBase)

  // Kirim email premium
  const emailName = profile?.fullName || userName || 'Sahabat'
  const emailAddr = profile?.email || userEmail || ''
  if (emailAddr) {
    sendEmail(buildPremiumEmail({ nama_user: emailName, email: emailAddr }))
      .then(r => { if (!r.ok) console.error('[Duitku] Email premium gagal:', r.error) })
      .catch(err => console.error('[Duitku] Email premium error:', err))
  }

  console.log(`[Duitku] ${userEmail} upgraded to Premium — ref: ${reference}`)

  return NextResponse.json({
    success: true,
    message: `${userEmail} berhasil diupgrade ke Premium`,
  })
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/webhook/duitku',
    description: 'Umrava Duitku webhook handler',
  })
}
