'use client'
import { useState } from 'react'
import { SPOT_FOTO } from '@/data/spotFoto'
import { cn } from '@/lib/utils'
import { MapPin, Clock, Star, ChevronRight, X, Lock, Crown } from 'lucide-react'
import type { SpotFoto } from '@/data/spotFoto'
import { usePlan } from '@/components/dashboard/PlanProvider'
import { UpgradeModal } from '@/components/dashboard/UpgradeModal'

const KOTA_FILTER = ['semua', 'makkah', 'madinah']
const WAKTU_FILTER = ['semua', 'pagi', 'siang', 'malam']
const FREE_SPOT_LIMIT = 5

export default function SpotFotoPage() {
  const [kotaFilter, setKotaFilter] = useState('semua')
  const [waktuFilter, setWaktuFilter] = useState('semua')
  const [selectedSpot, setSelectedSpot] = useState<SpotFoto | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { isPremium } = usePlan()

  const filtered = SPOT_FOTO.filter(s => {
    const kotaOk = kotaFilter === 'semua' || s.kota === kotaFilter
    const waktuOk = waktuFilter === 'semua' || s.waktuFoto.includes(waktuFilter as any)
    return kotaOk && waktuOk
  }).sort((a, b) => b.rating - a.rating)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D4A28] mb-1">📸 Spot Foto Terbaik di Tanah Suci</h1>
        <p className="text-[#6b7280] text-sm">Tips spot, waktu, dan angle terbaik dari fotografer umroh profesional</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-2">
          {KOTA_FILTER.map(k => (
            <button
              key={k}
              onClick={() => setKotaFilter(k)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all',
                kotaFilter === k ? 'bg-[#0D4A28] text-white' : 'bg-white text-[#6b7280] border border-gray-200 hover:border-[#0D4A28]'
              )}
            >
              {k === 'semua' ? 'Semua Kota' : k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {WAKTU_FILTER.slice(1).map(w => (
            <button
              key={w}
              onClick={() => setWaktuFilter(waktuFilter === w ? 'semua' : w)}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-semibold capitalize transition-all',
                waktuFilter === w ? 'bg-[#C9A84C] text-white' : 'bg-white text-[#6b7280] border border-gray-200 hover:border-[#C9A84C]'
              )}
            >
              {w === 'pagi' ? '🌅' : w === 'siang' ? '☀️' : '🌙'} {w}
            </button>
          ))}
        </div>
      </div>

      {/* Free limit notice */}
      {!isPremium && (
        <div className="flex items-center justify-between bg-[#F5E6C8] border border-[rgba(201,168,76,0.3)] rounded-2xl px-5 py-3 mb-4">
          <div className="text-sm text-[#8B6914]">
            <strong>Free:</strong> menampilkan {FREE_SPOT_LIMIT} dari {SPOT_FOTO.length} spot foto
          </div>
          <button onClick={() => setShowUpgrade(true)}
            className="flex items-center gap-1.5 bg-[#C9A84C] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#b8963d] transition-colors">
            <Crown size={11} /> Buka semua
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((spot, index) => {
          const isLocked = !isPremium && index >= FREE_SPOT_LIMIT
          return isLocked ? (
            <div key={spot.id} onClick={() => setShowUpgrade(true)}
              className="relative bg-white rounded-2xl border border-[rgba(201,168,76,0.12)] shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all group">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#C9A84C] flex items-center justify-center shadow-md">
                  <Lock size={16} className="text-white" />
                </div>
                <span className="text-xs font-bold text-[#8B6914]">Premium</span>
              </div>
              <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center opacity-30">
                <span className="text-5xl">{spot.emoji}</span>
              </div>
              <div className="p-4 opacity-30">
                <h3 className="font-bold text-[#0D4A28] mb-2 text-sm">{spot.nama}</h3>
              </div>
            </div>
          ) : (
          <div
            key={spot.id}
            onClick={() => setSelectedSpot(spot)}
            className="bg-white rounded-2xl border border-[rgba(201,168,76,0.12)] shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-[#C9A84C] transition-all group"
          >
            {/* Foto placeholder */}
            <div className="h-40 bg-gradient-to-br from-[#1B6B3A] to-[#0D4A28] flex items-center justify-center relative">
              <span className="text-6xl">{spot.emoji}</span>
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={cn(
                  'text-xs font-bold px-2 py-1 rounded-lg',
                  spot.kota === 'makkah' ? 'bg-[#C9A84C] text-white' : 'bg-[#1B6B3A] text-white'
                )}>
                  {spot.kota === 'makkah' ? 'Makkah' : 'Madinah'}
                </span>
                {spot.popularitas === 'sangat populer' && (
                  <span className="text-xs font-bold bg-red-500 text-white px-2 py-1 rounded-lg">🔥 Populer</span>
                )}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-[#0D4A28] mb-2 group-hover:text-[#1B6B3A] transition-colors">
                {spot.nama}
              </h3>

              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className={i < spot.rating ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-gray-200'} />
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs text-[#6b7280]">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  <strong>Terbaik:</strong> {spot.jamTerbaik}
                </span>
              </div>

              <p className="text-xs text-[#6b7280] mt-2 line-clamp-2">{spot.deskripsi}</p>

              <div className="mt-3 flex items-center gap-1 text-xs text-[#1B6B3A] font-semibold">
                Lihat detail <ChevronRight size={13} />
              </div>
            </div>
          </div>
          )
        })}
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {/* Detail Modal */}
      {selectedSpot && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header foto */}
            <div className="h-48 bg-gradient-to-br from-[#1B6B3A] to-[#0D4A28] flex items-center justify-center relative rounded-t-3xl">
              <span className="text-7xl">{selectedSpot.emoji}</span>
              <button
                onClick={() => setSelectedSpot(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-4 left-4">
                <h2 className="text-white font-bold text-lg leading-tight">{selectedSpot.nama}</h2>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < selectedSpot.rating ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-white/30'} />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Info badges */}
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1 text-xs bg-[#E8F5ED] text-[#1B6B3A] px-3 py-1.5 rounded-full font-semibold">
                  <Clock size={12} /> {selectedSpot.waktuTerbaik}: {selectedSpot.jamTerbaik}
                </span>
                <span className="flex items-center gap-1 text-xs bg-[#F5E6C8] text-[#8B6914] px-3 py-1.5 rounded-full font-semibold">
                  <MapPin size={12} /> {selectedSpot.kota === 'makkah' ? 'Makkah' : 'Madinah'}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-[#0D4A28] mb-1.5">Lokasi</h4>
                <p className="text-sm text-[#374151]">{selectedSpot.lokasi}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0D4A28] mb-1.5">Deskripsi</h4>
                <p className="text-sm text-[#374151] leading-relaxed">{selectedSpot.deskripsi}</p>
              </div>

              <div className="bg-[#E8F5ED] rounded-xl p-4">
                <h4 className="font-bold text-[#1B6B3A] mb-1.5 text-sm">📐 Tips Angle & Komposisi</h4>
                <p className="text-sm text-[#374151]">{selectedSpot.tipsAngle}</p>
              </div>

              <div className="bg-[#F5E6C8] rounded-xl p-4">
                <h4 className="font-bold text-[#8B6914] mb-1.5 text-sm">📱 Tips Kamera HP</h4>
                <p className="text-sm text-[#374151]">{selectedSpot.tipsKamera}</p>
              </div>

              {selectedSpot.peringatan && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-700">⚠️ {selectedSpot.peringatan}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <a
                  href={`https://maps.google.com/?q=${selectedSpot.koordinat?.lat},${selectedSpot.koordinat?.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#1B6B3A] text-white py-3 rounded-xl text-sm font-bold text-center hover:bg-[#0D4A28] transition-colors"
                >
                  📍 Buka di Maps
                </a>
                <button
                  onClick={() => setSelectedSpot(null)}
                  className="px-6 bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
