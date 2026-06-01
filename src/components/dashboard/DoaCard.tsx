'use client'
import { useState } from 'react'
import { Heart, ZoomIn, ZoomOut } from 'lucide-react'
import { AudioPlayer } from '@/components/audio/AudioPlayer'
import type { Doa } from '@/data/doa'
import { cn } from '@/lib/utils'

interface DoaCardProps {
  doa: Doa
  nightMode?: boolean
  isFavorited?: boolean
  onToggleFavorite?: (id: string) => void
}

export function DoaCard({ doa, nightMode, isFavorited, onToggleFavorite }: DoaCardProps) {
  const [fontSize, setFontSize] = useState(26)

  return (
    <div className={cn(
      'rounded-2xl p-6 border transition-colors',
      nightMode
        ? 'bg-[#0f2040] border-[rgba(201,168,76,0.3)] text-[#e8d5b0]'
        : 'bg-white border-[rgba(201,168,76,0.12)] shadow-sm'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className={cn('font-bold text-base', nightMode ? 'text-[#C9A84C]' : 'text-[#1B6B3A]')}>
          {doa.judul}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <button
            onClick={() => setFontSize(s => Math.min(38, s + 2))}
            className={cn('p-1.5 rounded-lg transition-colors', nightMode ? 'text-[#C9A84C] hover:bg-[rgba(201,168,76,0.2)]' : 'text-gray-400 hover:bg-gray-100')}
            title="Perbesar font"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setFontSize(s => Math.max(18, s - 2))}
            className={cn('p-1.5 rounded-lg transition-colors', nightMode ? 'text-[#C9A84C] hover:bg-[rgba(201,168,76,0.2)]' : 'text-gray-400 hover:bg-gray-100')}
            title="Perkecil font"
          >
            <ZoomOut size={16} />
          </button>
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(doa.id)}
              className={cn('p-1.5 rounded-lg transition-colors', isFavorited ? 'text-red-500' : nightMode ? 'text-[rgba(232,213,176,0.4)] hover:text-red-400' : 'text-gray-300 hover:text-red-400')}
              title={isFavorited ? 'Hapus favorit' : 'Simpan favorit'}
            >
              <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>

      {/* Arabic Text */}
      <div
        className={cn(
          'font-arabic text-right leading-relaxed mb-4 p-4 rounded-xl',
          nightMode ? 'bg-[rgba(201,168,76,0.08)] text-[#e8d5b0]' : 'bg-[#FBF7F0] text-[#1a1a1a]'
        )}
        style={{ fontSize: `${fontSize}px`, lineHeight: 2.2, fontFamily: "'Amiri', serif", direction: 'rtl' }}
      >
        {doa.arab}
      </div>

      {/* Latin */}
      <p className={cn('text-sm italic mb-3 leading-relaxed', nightMode ? 'text-[rgba(232,213,176,0.7)]' : 'text-[#6b7280]')}>
        {doa.latin}
      </p>

      {/* Terjemahan */}
      <p className={cn('text-sm leading-relaxed mb-4 p-3 rounded-xl', nightMode ? 'bg-[rgba(255,255,255,0.04)] text-[#e8d5b0]' : 'bg-gray-50 text-[#374151]')}>
        <span className={cn('font-semibold mr-1', nightMode ? 'text-[#C9A84C]' : 'text-[#1B6B3A]')}>Artinya:</span>
        {doa.terjemahan}
      </p>

      {/* Keutamaan */}
      {doa.keutamaan && (
        <div className={cn('text-xs leading-relaxed mb-4 p-3 rounded-xl border-l-2', nightMode ? 'bg-[rgba(201,168,76,0.08)] border-[#C9A84C] text-[rgba(232,213,176,0.7)]' : 'bg-[#F5E6C8] border-[#C9A84C] text-[#8B6914]')}>
          💡 {doa.keutamaan}
        </div>
      )}

      {/* Audio Player */}
      <AudioPlayer compact doaJudul={doa.judul} arabText={doa.arab} latinText={doa.latin} />
    </div>
  )
}
