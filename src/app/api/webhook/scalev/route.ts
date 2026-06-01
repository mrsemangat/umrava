import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Supabase admin client — bypass RLS untuk operasi webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface ScalevPayload {
  // Format utama ScaleV
  invoice_id?: string
  order_id?: string
  invoice_number?: string
  status?: string
  payment_status?: string
  buyer_email?: string
  buyer_name?: string
  customer_email?: string
  customer_name?: string
  email?: string
  name?: string
  product_name?: string
  product_id?: string
  amount?: number
  total?: number
  total_amount?: number
  paid_at?: string
  created_at?: string
  // Nested format
  customer?: { email?: string; name?: string }
  order?: { id?: string; status?: string; amount?: number }
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return true // skip jika belum dikonfigurasi
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  // Support format: sha256=xxx atau langsung hex
  const cleanSig = signature.replace('sha256=', '').replace('SHA256=', '')
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(cleanSig, 'hex'))
  } catch {
    return false
  }
}

function extractFields(payload: ScalevPayload) {
  const email =
    payload.buyer_email ??
    payload.customer_email ??
    payload.email ??
    payload.customer?.email ??
    ''

  const name =
    payload.buyer_name ??
    payload.customer_name ??
    payload.name ??
    payload.customer?.name ??
    ''

  const orderId =
    payload.invoice_id ??
    payload.order_id ??
    payload.invoice_number ??
    payload.order?.id ??
    ''

  const status =
    payload.status ??
    payload.payment_status ??
    payload.order?.status ??
    ''

  const amount =
    payload.amount ??
    payload.total ??
    payload.total_amount ??
    payload.order?.amount ??
    0

  return { email: email.toLowerCase().trim(), name, orderId, status, amount }
}

function isPaidStatus(status: string): boolean {
  const paid = ['paid', 'success', 'completed', 'settlement', 'capture', 'lunas', 'berhasil']
  return paid.includes(status.toLowerCase())
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  let payload: ScalevPayload

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Verifikasi signature
  const secret = process.env.SCALEV_WEBHOOK_SECRET ?? ''
  const signature =
    req.headers.get('x-scalev-signature') ??
    req.headers.get('x-webhook-signature') ??
    req.headers.get('x-signature') ??
    ''

  if (secret && !verifySignature(rawBody, signature, secret)) {
    console.error('[Webhook] Invalid signature')
    await logWebhook({ event: 'signature_invalid', payload, error: 'Invalid signature' })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const { email, name, orderId, status, amount } = extractFields(payload)

  // Log semua webhook masuk
  const logEntry = {
    source: 'scalev',
    event: isPaidStatus(status) ? 'order.paid' : `order.${status}`,
    order_id: orderId,
    buyer_email: email,
    buyer_name: name,
    amount,
    status,
    payload,
    user_upgraded: false,
    error: null as string | null,
    user_id: null as string | null,
  }

  // Hanya proses jika status paid
  if (!isPaidStatus(status)) {
    await logWebhook(logEntry)
    return NextResponse.json({
      received: true,
      message: `Status ${status} tidak memerlukan aksi`,
    })
  }

  if (!email) {
    logEntry.error = 'Email pembeli tidak ditemukan di payload'
    await logWebhook(logEntry)
    return NextResponse.json({ error: logEntry.error }, { status: 422 })
  }

  // Cek apakah sudah pernah diproses (idempotency)
  if (orderId) {
    const { data: existing } = await supabaseAdmin
      .from('webhook_logs')
      .select('id, user_upgraded')
      .eq('order_id', orderId)
      .eq('user_upgraded', true)
      .single()

    if (existing) {
      return NextResponse.json({
        received: true,
        message: 'Order sudah pernah diproses',
        already_processed: true,
      })
    }
  }

  // Cari user berdasarkan email
  const { data: profile, error: findError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, plan, full_name')
    .eq('email', email)
    .single()

  if (findError || !profile) {
    logEntry.error = `User tidak ditemukan: ${email}`
    await logWebhook(logEntry)
    // Return 200 agar ScaleV tidak retry terus-menerus
    return NextResponse.json({
      received: true,
      warning: logEntry.error,
      hint: 'User akan diupgrade saat daftar dengan email yang sama',
    })
  }

  // Sudah premium — tidak perlu upgrade lagi
  if (profile.plan === 'premium') {
    logEntry.user_id = profile.id
    logEntry.user_upgraded = false
    logEntry.error = 'User sudah premium'
    await logWebhook(logEntry)
    return NextResponse.json({ received: true, message: 'User sudah premium' })
  }

  // Upgrade ke premium
  const { error: upgradeError } = await supabaseAdmin
    .from('profiles')
    .update({
      plan: 'premium',
      premium_activated_at: new Date().toISOString(),
      full_name: profile.full_name ?? name ?? undefined,
    })
    .eq('id', profile.id)

  if (upgradeError) {
    logEntry.error = upgradeError.message
    logEntry.user_id = profile.id
    await logWebhook(logEntry)
    return NextResponse.json({ error: 'Gagal upgrade user' }, { status: 500 })
  }

  logEntry.user_upgraded = true
  logEntry.user_id = profile.id
  await logWebhook(logEntry)

  console.log(`[Webhook] ✅ ${email} upgraded to premium — order ${orderId}`)

  return NextResponse.json({
    received: true,
    upgraded: true,
    email,
    order_id: orderId,
    message: `${email} berhasil diupgrade ke premium`,
  })
}

async function logWebhook(entry: Record<string, unknown>) {
  try {
    await supabaseAdmin.from('webhook_logs').insert(entry)
  } catch (e) {
    console.error('[Webhook] Gagal log:', e)
  }
}

// GET — health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/webhook/scalev',
    accepts: 'POST',
    description: 'BaitGo ScaleV webhook — auto upgrade user ke premium saat order paid',
  })
}
