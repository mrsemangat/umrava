import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, checklistProgress, ibadahProgress } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { getDaysUntil } from '@/lib/utils'
import { UpgradeBanner } from '@/components/dashboard/UpgradeBanner'
import { Suspense } from 'react'
import { PixelNewUser } from '@/components/analytics/PixelNewUser'

export const dynamic = 'force-dynamic'

const TIPS_HARIAN = [
  "Perbanyak istighfar setiap hari sebagai persiapan rohani menuju Tanah Suci.",
  "Hafalkan doa melihat Ka'bah — ini adalah momen paling berkesan dalam umroh.",
  "Latih fisik dengan berjalan kaki minimal 5.000 langkah per hari untuk persiapan tawaf.",
  "Baca sirah Nabawiyah untuk menambah kecintaan kepada Rasulullah ﷺ.",
  "Perbanyak sholat dhuha sebagai latihan disiplin ibadah sebelum berangkat.",
  "Niatkan setiap langkah persiapan umroh sebagai ibadah kepada Allah.",
  "Belajar bahasa Arab dasar — minimal angka dan kalimat kebutuhan sehari-hari.",
]

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const params = await searchParams
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const [profile] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)

  const checklist = await db.select({ itemId: checklistProgress.itemId })
    .from(checklistProgress)
    .where(and(eq(checklistProgress.userId, session.user.id), eq(checklistProgress.checked, true)))

  const ibadahProgressData = await db.select().from(ibadahProgress)
    .where(eq(ibadahProgress.userId, session.user.id))

  const totalItems = 32
  const checked = checklist.length
  const progress = Math.round((checked / totalItems) * 100)
  const daysLeft = profile?.departureDate ? getDaysUntil(profile.departureDate) : null
  const activeTahap = ibadahProgressData.find(p => !p.completed)
  const todayTip = TIPS_HARIAN[new Date().getDay()]

  const name = profile?.fullName ?? profile?.name ?? session.user.email?.split('@')[0] ?? 'Jamaah'
  const firstName = name.split(' ')[0]
  const isPremium = profile?.plan === 'premium' || profile?.isAdmin === true

  return (
    <div className="max-w-4xl mx-auto">
      {params.welcome === '1' && (
        <Suspense fallback={null}>
          <PixelNewUser />
        </Suspense>
      )}
      {/* Upgrade Banner — hanya untuk free user */}
      {!isPremium && <UpgradeBanner />}

      {/* Greeting */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🤲</span>
          <h1 className="text-2xl font-bold text-[#0D4A28]">
            Bismillah, {firstName}
          </h1>
        </div>
        <p className="text-[#6b7280] ml-11">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center py-4">
          <div className="text-3xl font-black text-[#1B6B3A] mb-1">{progress}%</div>
          <div className="text-xs text-[#6b7280]">Persiapan</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-3xl font-black text-[#C9A84C] mb-1">
            {daysLeft !== null ? `H-${daysLeft}` : '—'}
          </div>
          <div className="text-xs text-[#6b7280]">Hari lagi</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-3xl font-black text-[#1B6B3A] mb-1">{checked}</div>
          <div className="text-xs text-[#6b7280]">Checklist selesai</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-3xl font-black text-[#C9A84C] mb-1">
            {ibadahProgressData.filter(p => p.completed).length}/6
          </div>
          <div className="text-xs text-[#6b7280]">Tahap ibadah</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/panduan" className="group">
          <Card className="hover:shadow-md transition-all hover:border-[#1B6B3A] cursor-pointer">
            <div className="text-3xl mb-3">🕌</div>
            <div className="font-bold text-[#0D4A28] mb-1">Lanjut Panduan Ibadah</div>
            <div className="text-sm text-[#6b7280]">
              {activeTahap ? `Sedang di Tahap ${activeTahap.tahapId}` : 'Mulai dari Tahap 1'}
            </div>
            <div className="mt-3 text-xs text-[#1B6B3A] font-semibold group-hover:underline">
              Buka panduan →
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/doa" className="group">
          <Card className="hover:shadow-md transition-all hover:border-[#C9A84C] cursor-pointer">
            <div className="text-3xl mb-3">🤲</div>
            <div className="font-bold text-[#0D4A28] mb-1">Buka Bank Doa</div>
            <div className="text-sm text-[#6b7280]">20+ doa lengkap dengan audio</div>
            <div className="mt-3 text-xs text-[#C9A84C] font-semibold group-hover:underline">
              Buka doa →
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/tracker" className="group">
          <Card className="hover:shadow-md transition-all hover:border-[#1B6B3A] cursor-pointer">
            <div className="text-3xl mb-3">✅</div>
            <div className="font-bold text-[#0D4A28] mb-1">Cek Checklist</div>
            <div className="text-sm text-[#6b7280]">{totalItems - checked} item belum selesai</div>
            <div className="mt-3 text-xs text-[#1B6B3A] font-semibold group-hover:underline">
              Lihat checklist →
            </div>
          </Card>
        </Link>
      </div>

      {/* Tip Harian */}
      <Card variant="gold" className="mb-8">
        <div className="flex items-start gap-4">
          <div className="text-3xl flex-shrink-0">💡</div>
          <div>
            <div className="text-sm font-bold text-[#8B6914] mb-1">Tip Ibadah Hari Ini</div>
            <p className="text-[#6b4c10] text-sm leading-relaxed">{todayTip}</p>
          </div>
        </div>
      </Card>

      {/* Doa Harian */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#0D4A28]">Doa yang Dianjurkan Hari Ini</h2>
          <Link href="/dashboard/doa" className="text-xs text-[#1B6B3A] hover:underline">Lihat semua →</Link>
        </div>
        <div className="bg-[#FBF7F0] rounded-xl p-4">
          <div className="text-right mb-3" style={{ fontFamily: "'Amiri', serif", fontSize: 24, direction: 'rtl', lineHeight: 2 }}>
            سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ
          </div>
          <p className="text-sm italic text-[#6b7280] mb-2">Subhanallaahi wa bihamdihi, subhanallaahil-&apos;azhiim</p>
          <p className="text-sm text-[#374151]">Maha Suci Allah dan dengan memuji-Nya, Maha Suci Allah Yang Maha Agung.</p>
        </div>
      </Card>

      {/* Setup departure date CTA */}
      {!profile?.departureDate && (
        <Card className="border-2 border-dashed border-[#C9A84C] bg-[#FFFDF5]">
          <div className="text-center py-2">
            <div className="text-3xl mb-2">📅</div>
            <h3 className="font-bold text-[#0D4A28] mb-1">Set Tanggal Keberangkatan</h3>
            <p className="text-sm text-[#6b7280] mb-4">Agar countdown dan reminder bisa aktif</p>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 bg-[#C9A84C] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#b8963d] transition-colors"
            >
              Set sekarang →
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
