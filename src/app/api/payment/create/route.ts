import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, webhookLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { createTransaction, buildMerchantRef, METHOD_GROUPS } from '@/lib/duitku'
import { getDuitkuConfig } from '@/lib/paymentSettings'
import { sendEmail } from '@/lib/mailketing'
import { buildTransactionEmail } from '@/lib/emailTemplates'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })

  const [profile] = await db.select({
    plan: users.plan,
    fullName: users.fullName,
    email: users.email,
  }).from(users).where(eq(users.id, session.user.id)).limit(1)

  if (profile?.plan === 'premium') {
    return NextResponse.json({ error: 'Akun Anda sudah Premium' }, { status: 400 })
  }

  const body = await req.json()
  const { method, phone } = body
  if (!method) return NextResponse.json({ error: 'Metode pembayaran diperlukan' }, { status: 400 })

  const merchantOrderId = buildMerchantRef(session.user.id)
  const customerName = profile?.fullName || session.user.email?.split('@')[0] || 'Pengguna'
  const customerEmail = profile?.email || session.user.email || ''

  try {
    const cfg = await getDuitkuConfig()
    const tx = await createTransaction({
      method,
      merchantOrderId,
      customerName,
      customerEmail,
      customerPhone: phone || '08000000000',
    }, cfg)

    await db.insert(webhookLogs).values({
      source: 'duitku',
      event: 'transaction.created',
      orderId: merchantOrderId,
      buyerEmail: customerEmail,
      buyerName: customerName,
      amount: tx.total_amount,
      status: 'UNPAID',
      userId: session.user.id,
      userUpgraded: false,
      payload: { reference: tx.reference, merchantOrderId, method },
    })

    // Kirim email instruksi pembayaran
    if (customerEmail) {
      const metodeLabel = METHOD_GROUPS[method.toUpperCase()] || method
      sendEmail(buildTransactionEmail({
        nama_user: customerName,
        email: customerEmail,
        order_id: merchantOrderId,
        metode: metodeLabel,
        va_number: tx.vaNumber,
        payment_url: tx.paymentUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/upgrade`,
        expired_time: tx.expired_time,
      })).then(r => {
        if (!r.ok) console.error('[Payment/Create] Email gagal:', r.error)
      }).catch(err => console.error('[Payment/Create] Email error:', err))
    }

    return NextResponse.json({ success: true, transaction: tx })
  } catch (e) {
    console.error('[Payment/Create] Transaksi gagal:', (e as Error).message)
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 })
  }
}
