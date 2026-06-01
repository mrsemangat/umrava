'use client'
import { useState, useEffect, useCallback } from 'react'
import { ZIKIR_PAGI, getZikirByWaktu, type ZikirItem } from '@/data/zikir'
import { usePlan } from '@/components/dashboard/PlanProvider'
import { PremiumGate } from '@/components/dashboard/PremiumGate'
import { AudioPlayer } from '@/components/audio/AudioPlayer'
import { cn } from '@/lib/utils'
import { Sun, Moon, RotateCcw, CheckCircle2, ChevronDown, ChevronUp, BookOpen, ZoomIn, ZoomOut } from 'lucide-react'

type Waktu = 'pagi' | 'petang'

function getDefaultWaktu(): Waktu {
  const jam = new Date().getHours()
  return jam >= 5 && jam < 15 ? 'pagi' : 'petang'
}

function ZikirCard({
  item, isActive, isDone, onDone, fontSize,
}: {
  item: ZikirItem
  isActive: boolean
  isDone: boolean
  onDone: () => void
  fontSize: number
}) {
  const [hitungan, setHitungan] = useState(0)
  const [expanded, setExpanded] = useState(isActive)

  const tekan = useCallback(() => {
    if (hitungan >= item.ulangan) return
    const next = hitungan + 1
    setHitungan(next)
    if (next >= item.ulangan) onDone()
  }, [hitungan, item.ulangan, onDone])

  useEffect(() => {
    if (isActive) setExpanded(true)
  }, [isActive])

  const persen = Math.round((hitungan / item.ulangan) * 100)

  return (
    <div className={cn(
      'rounded-2xl border transition-all duration-300 overflow-hidden',
      isDone
        ? 'bg-[#E8F5ED] border-[#1B6B3A]/20'
        : isActive
        ? 'bg-white border-[#C9A84C] shadow-md ring-1 ring-[#C9A84C]/30'
        : 'bg-white border-[rgba(201,168,76,0.12)] shadow-sm'
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        {/* Nomor / check */}
        <div className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 transition-all',
          isDone
            ? 'bg-[#1B6B3A] text-white'
            : isActive
            ? 'bg-[#C9A84C] text-white'
            : 'bg-gray-100 text-gray-400'
        )}>
          {isDone ? <CheckCircle2 size={18} /> : item.urutan}
        </div>

        <div className="flex-1 min-w-0">
          <div className={cn('font-bold text-sm truncate', isDone ? 'text-[#1B6B3A]' : 'text-[#0D4A28]')}>
            {item.judul}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {item.ulangan}× {item.sumber && `· ${item.sumber}`}
          </div>
        </div>

        {/* Progress mini */}
        {hitungan > 0 && !isDone && (
          <div className="text-xs font-bold text-[#C9A84C] flex-shrink-0">
            {hitungan}/{item.ulangan}
          </div>
        )}
        {isDone && (
          <div className="text-xs font-bold text-[#1B6B3A] flex-shrink-0">Selesai ✓</div>
        )}

        {expanded
          ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
          : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
      </button>

      {/* Konten */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">
          {/* Progress bar */}
          {item.ulangan > 1 && (
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3 mb-4">
              <div
                className={cn('h-full rounded-full transition-all duration-300', isDone ? 'bg-[#1B6B3A]' : 'bg-[#C9A84C]')}
                style={{ width: `${persen}%` }}
              />
            </div>
          )}

          {/* Arabic */}
          <div
            className="text-right leading-loose mb-3 p-4 bg-[#FBF7F0] rounded-xl text-[#1a1a1a]"
            style={{ fontFamily: "'Amiri', serif", fontSize: `${fontSize}px`, direction: 'rtl', lineHeight: 2.2 }}
          >
            {item.arab}
          </div>

          {/* Latin */}
          <p className="text-sm italic text-gray-400 mb-2 leading-relaxed">{item.latin}</p>

          {/* Terjemahan */}
          <div className="bg-gray-50 rounded-xl p-3 mb-3 text-sm text-[#374151] leading-relaxed">
            <span className="font-semibold text-[#1B6B3A]">Artinya: </span>
            {item.terjemahan}
          </div>

          {/* Keutamaan */}
          {item.keutamaan && (
            <div className="bg-[#F5E6C8] rounded-xl p-3 mb-4 text-xs text-[#8B6914] leading-relaxed">
              💡 {item.keutamaan}
            </div>
          )}

          {/* Audio */}
          <div className="mb-4">
            <AudioPlayer compact doaJudul={item.judul} />
          </div>

          {/* Tombol hitung */}
          {!isDone ? (
            <div className="space-y-2">
              <button
                onClick={tekan}
                className="w-full py-4 rounded-2xl font-black text-lg text-white bg-[#C9A84C] hover:bg-[#b8963d] active:scale-95 transition-all shadow-md"
              >
                {item.ulangan === 1 ? 'Selesai Baca ✓' : (
                  hitungan === 0
                    ? `Mulai — ${item.ulangan}×`
                    : `${hitungan}/${item.ulangan} — Lanjut`
                )}
              </button>
              {hitungan > 0 && (
                <button
                  onClick={() => setHitungan(0)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 py-1"
                >
                  <RotateCcw size={12} /> Ulangi dari awal
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-3 bg-[#E8F5ED] rounded-2xl">
              <CheckCircle2 size={18} className="text-[#1B6B3A]" />
              <span className="font-bold text-[#1B6B3A] text-sm">Selesai — Barakallah fiik</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ZikirContent() {
  const [waktu, setWaktu] = useState<Waktu>(getDefaultWaktu())
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set())
  const [fontSize, setFontSize] = useState(24)
  const [showInfo, setShowInfo] = useState(false)

  const items = getZikirByWaktu(waktu)
  const totalDone = doneIds.size
  const totalItems = items.length
  const persen = Math.round((totalDone / totalItems) * 100)
  const activeIndex = items.findIndex(z => !doneIds.has(z.id))

  const handleDone = useCallback((id: string) => {
    setDoneIds(prev => new Set([...prev, id]))
  }, [])

  const resetSemua = () => setDoneIds(new Set())

  const switchWaktu = (w: Waktu) => {
    setWaktu(w)
    setDoneIds(new Set())
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black text-[#0D4A28]">Zikir Pagi & Petang</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setFontSize(s => Math.min(36, s + 2))} className="p-1.5 text-gray-400 hover:text-[#0D4A28]"><ZoomIn size={16} /></button>
            <button onClick={() => setFontSize(s => Math.max(18, s - 2))} className="p-1.5 text-gray-400 hover:text-[#0D4A28]"><ZoomOut size={16} /></button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <BookOpen size={14} />
          <span>Al-Awrad Al-Banna — Hasan Al-Banna رحمه الله</span>
          <button onClick={() => setShowInfo(!showInfo)} className="text-[#C9A84C] hover:underline text-xs">ℹ️</button>
        </div>
        {showInfo && (
          <div className="mt-2 p-3 bg-[#F5E6C8] rounded-xl text-xs text-[#8B6914] leading-relaxed">
            Al-Awrad adalah kumpulan dzikir pagi dan petang yang disusun oleh Imam Hasan Al-Banna (1906-1949), pendiri Ikhwanul Muslimin. Dzikir-dzikir ini bersumber dari hadits-hadits shahih dan merupakan amalan yang dianjurkan dibaca setelah Subuh (pagi) dan setelah Asar (petang).
          </div>
        )}
      </div>

      {/* Pilih waktu */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={() => switchWaktu('pagi')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all',
            waktu === 'pagi'
              ? 'bg-[#C9A84C] text-white shadow-md'
              : 'bg-white border border-[rgba(201,168,76,0.2)] text-gray-500 hover:border-[#C9A84C]'
          )}
        >
          <Sun size={17} /> Zikir Pagi
        </button>
        <button
          onClick={() => switchWaktu('petang')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all',
            waktu === 'petang'
              ? 'bg-[#0D4A28] text-white shadow-md'
              : 'bg-white border border-[rgba(27,107,58,0.2)] text-gray-500 hover:border-[#0D4A28]'
          )}
        >
          <Moon size={17} /> Zikir Petang
        </button>
      </div>

      {/* Progress overview */}
      <div className={cn(
        'rounded-2xl p-5 mb-6 text-white',
        waktu === 'pagi'
          ? 'bg-gradient-to-r from-[#C9A84C] to-[#E0BD6A]'
          : 'bg-gradient-to-r from-[#0D4A28] to-[#1B6B3A]'
      )}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-black text-2xl">{persen}%</div>
            <div className="text-white/80 text-sm">
              {totalDone} dari {totalItems} zikir selesai
            </div>
          </div>
          <div className="text-right">
            {persen === 100 ? (
              <div className="text-center">
                <div className="text-3xl mb-1">🤲</div>
                <div className="text-sm font-bold">Alhamdulillah!</div>
              </div>
            ) : (
              <div className="text-white/60 text-sm">
                {waktu === 'pagi' ? 'Setelah Subuh' : 'Setelah Asar'}
              </div>
            )}
          </div>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${persen}%` }}
          />
        </div>
        {persen === 100 && (
          <button onClick={resetSemua} className="mt-3 text-xs text-white/70 hover:text-white flex items-center gap-1">
            <RotateCcw size={11} /> Ulangi zikir
          </button>
        )}
      </div>

      {/* Daftar Zikir */}
      <div className="space-y-3 pb-8">
        {items.map((item, i) => (
          <ZikirCard
            key={`${waktu}-${item.id}`}
            item={item}
            isActive={i === activeIndex}
            isDone={doneIds.has(item.id)}
            onDone={() => handleDone(item.id)}
            fontSize={fontSize}
          />
        ))}
      </div>

      <p className="text-xs text-center text-gray-400 pb-6">
        ⚠️ Konten dzikir bersumber dari hadits-hadits shahih. Konsultasikan dengan ustadz untuk kepastian lebih lanjut.
      </p>
    </div>
  )
}

export default function ZikirPage() {
  const { isPremium } = usePlan()

  return (
    <PremiumGate
      isPremium={isPremium}
      featureName="Zikir Pagi & Petang"
      description="Akses Al-Awrad Al-Banna lengkap — 15 zikir dengan counter, audio, dan panduan bacaan. Khusus member Premium."
    >
      <ZikirContent />
    </PremiumGate>
  )
}
