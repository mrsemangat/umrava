'use client'
import { useState } from 'react'
import Link from 'next/link'
import { TAHAP_IBADAH } from '@/data/panduan'
import { DATA_DOA } from '@/data/doa'
import { TawafCounter } from '@/components/dashboard/TawafCounter'
import { AudioPlayer } from '@/components/audio/AudioPlayer'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react'

export default function PanduanPage() {
  const [activeTahap, setActiveTahap] = useState<string>('miqat')
  const [completedTahap, setCompletedTahap] = useState<string[]>([])
  const [expandedKonten, setExpandedKonten] = useState(true)

  const tahap = TAHAP_IBADAH.find(t => t.id === activeTahap)!

  const markComplete = (id: string) => {
    setCompletedTahap(prev => prev.includes(id) ? prev : [...prev, id])
  }

  const currentIndex = TAHAP_IBADAH.findIndex(t => t.id === activeTahap)
  const nextTahap = TAHAP_IBADAH[currentIndex + 1]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D4A28] mb-1">Panduan Ibadah Umroh</h1>
        <p className="text-[#6b7280] text-sm">Step-by-step panduan lengkap dari miqat hingga tahallul</p>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-[rgba(201,168,76,0.12)] overflow-x-auto">
        <div className="flex items-center min-w-max gap-0">
          {TAHAP_IBADAH.map((t, i) => {
            const isDone = completedTahap.includes(t.id)
            const isActive = t.id === activeTahap
            return (
              <div key={t.id} className="flex items-center">
                <button
                  onClick={() => { setActiveTahap(t.id); setExpandedKonten(true) }}
                  className={cn(
                    'flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all',
                    isActive ? 'bg-[#E8F5ED]' : 'hover:bg-gray-50'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold border-2 transition-all',
                    isDone
                      ? 'bg-[#1B6B3A] border-[#1B6B3A] text-white'
                      : isActive
                      ? 'bg-[#C9A84C] border-[#C9A84C] text-white scale-110'
                      : 'bg-white border-gray-200 text-gray-400'
                  )}>
                    {isDone ? <CheckCircle2 size={20} /> : <span className="text-lg">{t.icon}</span>}
                  </div>
                  <span className={cn(
                    'text-xs font-medium text-center leading-tight max-w-16',
                    isActive ? 'text-[#1B6B3A]' : isDone ? 'text-[#1B6B3A]' : 'text-gray-400'
                  )}>
                    {t.judul.split('(')[0].split(' & ')[0].split(' ').slice(0, 2).join(' ')}
                  </span>
                </button>
                {i < TAHAP_IBADAH.length - 1 && (
                  <div className={cn(
                    'h-0.5 w-8 rounded-full mx-1',
                    completedTahap.includes(t.id) ? 'bg-[#1B6B3A]' : 'bg-gray-200'
                  )} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Tahap Header */}
      <div className="bg-[#0D4A28] rounded-2xl p-6 mb-4 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[#C9A84C] text-sm font-semibold mb-1">Tahap {tahap.nomor} dari {TAHAP_IBADAH.length}</div>
            <h2 className="text-2xl font-bold mb-2">{tahap.icon} {tahap.judul}</h2>
            <p className="text-[rgba(251,247,240,0.8)] text-sm leading-relaxed">{tahap.subtitle}</p>
          </div>
          <button
            onClick={() => setExpandedKonten(!expandedKonten)}
            className="text-[#C9A84C] hover:text-white transition-colors mt-1"
          >
            {expandedKonten ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        </div>

        {/* Counter if applicable */}
        {tahap.counterType && (
          <div className="mt-4">
            <TawafCounter
              type={tahap.counterType}
              max={tahap.counterMax!}
              onComplete={() => markComplete(tahap.id)}
            />
          </div>
        )}
      </div>

      {/* Konten Detail */}
      {expandedKonten && (
        <div className="space-y-4">
          {tahap.konten.map((k, idx) => {
            if (k.tipe === 'counter') return null // rendered above

            const doa = k.tipe === 'doa' && k.doaId ? DATA_DOA.find(d => d.id === k.doaId) : null

            return (
              <div key={idx} className={cn(
                'rounded-2xl p-5',
                k.tipe === 'tip' ? 'bg-[#F5E6C8] border border-[rgba(201,168,76,0.3)]' :
                k.tipe === 'warning' ? 'bg-red-50 border border-red-200' :
                'bg-white border border-[rgba(201,168,76,0.12)] shadow-sm'
              )}>
                {k.tipe === 'text' && (
                  <>
                    {k.judul && <h3 className="font-bold text-[#0D4A28] mb-2">{k.judul}</h3>}
                    <p className="text-[#374151] text-sm leading-relaxed">{k.isi}</p>
                  </>
                )}

                {k.tipe === 'list' && (
                  <>
                    {k.judul && <h3 className="font-bold text-[#0D4A28] mb-3">{k.judul}</h3>}
                    <ul className="space-y-2">
                      {k.items?.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#374151]">
                          <span className="text-[#C9A84C] mt-0.5 flex-shrink-0">
                            {item.startsWith('🚫') || item.startsWith('✅') ? '' : '•'}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {k.tipe === 'tip' && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">💡</span>
                    <p className="text-[#8B6914] text-sm leading-relaxed">{k.isi}</p>
                  </div>
                )}

                {k.tipe === 'warning' && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">⚠️</span>
                    <p className="text-red-700 text-sm leading-relaxed">{k.isi}</p>
                  </div>
                )}

                {k.tipe === 'doa' && doa && (
                  <>
                    {k.judul && <h3 className="font-bold text-[#0D4A28] mb-3">{k.judul}</h3>}
                    <div className="bg-[#FBF7F0] rounded-xl p-4 mb-3">
                      <div
                        className="text-right mb-3 text-[#1a1a1a]"
                        style={{ fontFamily: "'Amiri', serif", fontSize: 26, direction: 'rtl', lineHeight: 2.2 }}
                      >
                        {doa.arab}
                      </div>
                      <p className="text-sm italic text-[#6b7280] mb-2">{doa.latin}</p>
                      <p className="text-sm text-[#374151]">
                        <span className="font-semibold text-[#1B6B3A]">Artinya: </span>
                        {doa.terjemahan}
                      </p>
                    </div>
                    <AudioPlayer compact doaJudul={doa.judul} arabText={doa.arab} latinText={doa.latin} />
                  </>
                )}
              </div>
            )
          })}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2 pb-6">
            {currentIndex > 0 ? (
              <button
                onClick={() => setActiveTahap(TAHAP_IBADAH[currentIndex - 1].id)}
                className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#0D4A28] transition-colors"
              >
                ← {TAHAP_IBADAH[currentIndex - 1].judul.split('(')[0]}
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              {!completedTahap.includes(tahap.id) && !tahap.counterType && (
                <button
                  onClick={() => markComplete(tahap.id)}
                  className="flex items-center gap-2 bg-[#1B6B3A] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0D4A28] transition-colors"
                >
                  <CheckCircle2 size={16} />
                  Tahap selesai
                </button>
              )}
              {nextTahap && (
                <button
                  onClick={() => setActiveTahap(nextTahap.id)}
                  className="flex items-center gap-2 bg-[#C9A84C] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#b8963d] transition-colors"
                >
                  {nextTahap.judul.split('(')[0]} →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ziarah Madinah CTA */}
      <Link href="/dashboard/panduan/madinah" className="block bg-white rounded-2xl p-5 border border-[rgba(201,168,76,0.12)] shadow-sm mb-8 hover:shadow-md hover:border-[#1B6B3A] transition-all group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5ED] flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-[#1B6B3A] transition-colors">🕌</div>
          <div className="flex-1">
            <h3 className="font-bold text-[#0D4A28] mb-0.5">Panduan Ziarah Madinah</h3>
            <p className="text-sm text-[#6b7280]">Masjid Nabawi · Raudhah · Makam Nabi ﷺ · Masjid Quba · Jabal Uhud · Kebun Kurma</p>
          </div>
          <div className="text-[#1B6B3A] font-bold text-xl group-hover:translate-x-1 transition-transform">→</div>
        </div>
      </Link>
    </div>
  )
}
