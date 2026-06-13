import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { getTransactionStatus } from '@/lib/duitku'
import { getDuitkuConfig } from '@/lib/paymentSettings'
import { db } from '@/lib/db'
import { users, webhookLogs } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { sendEmail } from '@/lib/mailketing'
import { buildPremiumEmail } from '@/lib/emailTemplates'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  if (!orderId) return NextResponse.json({ error: 'orderId diperlukan' }, { status: 400 })

  try {
    const cfg = await getDuitkuConfig()
    const result = await getTransactionStatus(orderId, cfg)
    const statusMap: Record<string, string> = { '00': 'PAID', '01': 'PENDING', '02': 'FAILED' }

    // Fallback upgrade: jika Duitku konfirmasi lunas tapi webhook belum memproses
    if (result.statusCode === '00') {
      const userId = session.user.id
      const [profile] = await db
        .select({ plan: users.plan, fullName: users.fullName, email: users.email })
        .from(users).where(eq(users.id, userId)).limit(1)

      if (profile && profile.plan !== 'premium') {
        // Idempotency: pastikan belum pernah diupgrade lewat jalur ini
        const alreadyLogged = await db
          .select({ id: webhookLogs.id })
          .from(webhookLogs)
          .where(and(eq(webhookLogs.orderId, orderId), eq(webhookLogs.userUpgraded, true)))
          .limit(1)

        if (alreadyLogged.length === 0) {
          await db.update(users)
            .set({ plan: 'premium', premiumActivatedAt: new Date() })
            .where(eq(users.id, userId))

          await db.insert(webhookLogs).values({
            source: 'duitku',
            event: 'payment.paid.poll',
            orderId,
            amount: 49000,
            status: 'PAID',
            userId,
            buyerEmail: profile.email,
            buyerName: profile.fullName,
            userUpgraded: true,
            payload: { statusCode: result.statusCode, source: 'poll_fallback' },
            error: null,
          })

          const emailAddr = profile.email || ''
          if (emailAddr) {
            sendEmail(buildPremiumEmail({
              nama_user: profile.fullName || 'Sahabat',
              email: emailAddr,
            })).catch(() => {})
          }

          console.log(`[PaymentStatus] Fallback upgrade: ${profile.email} → Premium (orderId: ${orderId})`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      statusCode: result.statusCode,
      status: statusMap[result.statusCode] ?? 'UNKNOWN',
      statusMessage: result.statusMessage,
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 })
  }
}
