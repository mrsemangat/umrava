import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, manualPayments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getPaymentMethodSettings } from '@/lib/paymentSettings'
import { sendEmail } from '@/lib/mailketing'
import { buildBankTransferEmail } from '@/lib/emailTemplates'

export const dynamic = 'force-dynamic'

function buildOrderId(userId: string) {
  const short = userId.replace(/-/g, '').slice(0, 8).toUpperCase()
  const ts = Date.now().toString().slice(-6)
  return `MT-${short}-${ts}`
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })

  const settings = await getPaymentMethodSettings()
  if (!settings.bankTransferEnabled) {
    return NextResponse.json({ error: 'Transfer manual tidak aktif' }, { status: 400 })
  }

  const [profile] = await db.select({
    plan: users.plan,
    fullName: users.fullName,
    email: users.email,
  }).from(users).where(eq(users.id, session.user.id)).limit(1)

  if (profile?.plan === 'premium') {
    return NextResponse.json({ error: 'Akun Anda sudah Premium' }, { status: 400 })
  }

  // Cek apakah ada pending order yang belum diproses
  const [existing] = await db.select({ id: manualPayments.id, status: manualPayments.status })
    .from(manualPayments)
    .where(eq(manualPayments.userId, session.user.id))
    .limit(1)

  if (existing?.status === 'pending') {
    return NextResponse.json({
      error: 'Anda masih memiliki transfer yang menunggu konfirmasi. Hubungi admin jika sudah transfer.',
      existingOrderId: existing.id,
    }, { status: 400 })
  }

  const body = await req.json()
  const { bankName } = body

  const merchantOrderId = buildOrderId(session.user.id)
  const customerName = profile?.fullName || session.user.email?.split('@')[0] || 'Pengguna'
  const customerEmail = profile?.email || session.user.email || ''

  const [inserted] = await db.insert(manualPayments).values({
    userId: session.user.id,
    merchantOrderId,
    userName: customerName,
    userEmail: customerEmail,
    amount: 49000,
    bankName: bankName || null,
    status: 'pending',
  }).returning({ id: manualPayments.id })

  if (!inserted) return NextResponse.json({ error: 'Gagal membuat order' }, { status: 500 })

  // Kirim email instruksi transfer
  if (customerEmail) {
    const selectedBank = settings.bankAccounts.find(
      b => b.bankName.toLowerCase() === (bankName || '').toLowerCase()
    ) ?? settings.bankAccounts[0]

    if (selectedBank) {
      sendEmail(buildBankTransferEmail({
        nama_user: customerName,
        email: customerEmail,
        order_id: merchantOrderId,
        bank_name: selectedBank.bankName,
        account_number: selectedBank.accountNumber,
        account_name: selectedBank.accountName,
      })).then(r => {
        if (!r.ok) console.error('[BankTransfer] Email gagal:', r.error)
      }).catch(err => console.error('[BankTransfer] Email error:', err))
    } else {
      console.warn('[BankTransfer] Tidak ada rekening bank — email instruksi tidak dikirim')
    }
  }

  return NextResponse.json({
    success: true,
    orderId: inserted.id,
    merchantOrderId,
    amount: 49000,
  })
}
