'use client'
import { useState } from 'react'
import { KOTA_ASAL, hitungBiaya, ITINERARY_TEMPLATES, NAMA_BULAN, type BiayaConfig } from '@/data/biaya'
import { CHECKLIST_FASES, getAllChecklistItems } from '@/data/checklist'
import { formatRupiah } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PremiumGate } from '@/components/dashboard/PremiumGate'
import { usePlan } from '@/components/dashboard/PlanProvider'

const TABS = ['Estimasi Biaya', 'Checklist Persiapan', 'Itinerary Builder']

export default function PerencanaanPage() {
  const [activeTab, setActiveTab] = useState(0)
  const { isPremium } = usePlan()

  const TABS_WITH_LOCK = [
    { label: 'Estimasi Biaya', premium: true },
    { label: 'Checklist Persiapan', premium: false },
    { label: 'Itinerary Builder', premium: true },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D4A28] mb-1">Perencanaan Umroh</h1>
        <p className="text-[#6b7280] text-sm">Estimasi biaya, checklist dokumen, dan itinerary perjalanan</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl p-1 mb-6 shadow-sm border border-[rgba(201,168,76,0.12)]">
        {TABS_WITH_LOCK.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={cn(
              'flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5',
              activeTab === i ? 'bg-[#1B6B3A] text-white shadow-sm' : 'text-[#6b7280] hover:text-[#0D4A28]'
            )}
          >
            {tab.label}
            {tab.premium && !isPremium && <span className="text-[10px]">🔒</span>}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <PremiumGate isPremium={isPremium} featureName="Kalkulator Estimasi Biaya" description="Hitung estimasi biaya umroh mandirimu secara detail — tiket, visa, hotel, makan, hingga oleh-oleh.">
          <EstimaBiayaTab />
        </PremiumGate>
      )}
      {activeTab === 1 && <ChecklistTab />}
      {activeTab === 2 && (
        <PremiumGate isPremium={isPremium} featureName="Itinerary Builder" description="Buat jadwal perjalanan hari per hari dan export ke PDF — siap cetak untuk dibawa ke Tanah Suci.">
          <ItineraryTab />
        </PremiumGate>
      )}
    </div>
  )
}

function EstimaBiayaTab() {
  const [config, setConfig] = useState<BiayaConfig>({
    kotaAsal: 'jakarta',
    bulanPergi: new Date().getMonth() + 1,
    durasi: 12,
    jumlahOrang: 2,
    hotelBintang: 4,
    budgetOleholeh: 3_000_000,
  })
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<ReturnType<typeof hitungBiaya> | null>(null)

  const calculate = () => {
    setResult(hitungBiaya(config))
    setShowResult(true)
  }

  return (
    <div>
      <Card className="mb-6">
        <h2 className="font-bold text-[#0D4A28] mb-5">Isi Detail Perjalanan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Kota Keberangkatan</label>
            <select
              value={config.kotaAsal}
              onChange={e => setConfig(c => ({ ...c, kotaAsal: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1B6B3A] bg-white"
            >
              {KOTA_ASAL.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Bulan Keberangkatan</label>
            <select
              value={config.bulanPergi}
              onChange={e => setConfig(c => ({ ...c, bulanPergi: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1B6B3A] bg-white"
            >
              {NAMA_BULAN.slice(1).map((b, i) => <option key={i+1} value={i+1}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Durasi Perjalanan</label>
            <div className="flex gap-2">
              {[9, 12, 14].map(d => (
                <button
                  key={d}
                  onClick={() => setConfig(c => ({ ...c, durasi: d }))}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                    config.durasi === d ? 'bg-[#1B6B3A] text-white border-[#1B6B3A]' : 'border-gray-200 text-[#374151] hover:border-[#1B6B3A]'
                  )}
                >
                  {d} Hari
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Jumlah Orang: {config.jumlahOrang}</label>
            <input
              type="range" min={1} max={10} value={config.jumlahOrang}
              onChange={e => setConfig(c => ({ ...c, jumlahOrang: Number(e.target.value) }))}
              className="w-full accent-[#1B6B3A]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1</span><span>10</span></div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Kelas Hotel</label>
            <div className="flex gap-2">
              {([3, 4, 5] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setConfig(c => ({ ...c, hotelBintang: b }))}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                    config.hotelBintang === b ? 'bg-[#C9A84C] text-white border-[#C9A84C]' : 'border-gray-200 text-[#374151] hover:border-[#C9A84C]'
                  )}
                >
                  {'⭐'.repeat(b)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">
              Budget Oleh-oleh: {formatRupiah(config.budgetOleholeh)}/orang
            </label>
            <input
              type="range" min={0} max={10_000_000} step={500_000} value={config.budgetOleholeh}
              onChange={e => setConfig(c => ({ ...c, budgetOleholeh: Number(e.target.value) }))}
              className="w-full accent-[#C9A84C]"
            />
          </div>
        </div>

        <button
          onClick={calculate}
          className="w-full mt-6 bg-[#1B6B3A] hover:bg-[#0D4A28] text-white py-3.5 rounded-xl font-bold text-base transition-colors"
        >
          🧮 Hitung Estimasi Biaya
        </button>
      </Card>

      {showResult && result && (
        <Card className="border-2 border-[rgba(201,168,76,0.3)]">
          <h2 className="font-bold text-[#0D4A28] text-center text-lg mb-5">
            Estimasi Biaya Umroh Mandiri
          </h2>
          <div className="space-y-3 mb-5">
            {[
              { icon: '✈️', label: `Tiket Pesawat PP (${config.jumlahOrang} orang)`, val: result.tiketPesawat },
              { icon: '🛂', label: 'Visa Umroh', val: result.visa },
              { icon: '💉', label: 'Vaksin Meningitis', val: result.vaksin },
              { icon: '🏨', label: `Hotel Makkah`, val: result.hotelMakkah },
              { icon: '🏨', label: `Hotel Madinah`, val: result.hotelMadinah },
              { icon: '🚌', label: 'Transportasi Lokal', val: result.busTransport },
              { icon: '🍽️', label: `Konsumsi (${config.durasi} hari)`, val: result.konsumsi },
              { icon: '🎁', label: 'Oleh-oleh', val: result.oleholeh },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-[#374151]">{item.icon} {item.label}</span>
                <span className="font-semibold text-sm text-[#0D4A28]">{formatRupiah(item.val)}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#0D4A28] rounded-xl p-4 text-white text-center mb-4">
            <div className="text-sm mb-1">TOTAL ESTIMASI</div>
            <div className="text-3xl font-black">{formatRupiah(result.total)}</div>
            <div className="text-[#C9A84C] text-sm mt-1">untuk {config.jumlahOrang} orang</div>
          </div>

          <div className="bg-[#F5E6C8] rounded-xl p-4 text-center">
            <div className="text-sm text-[#8B6914] mb-1">Target tabungan per bulan (12 bulan)</div>
            <div className="text-2xl font-black text-[#C9A84C]">
              {formatRupiah(result.perBulanNabung(12))}
            </div>
          </div>

          <p className="text-xs text-[#6b7280] text-center mt-4">
            * Estimasi berdasarkan harga rata-rata. Harga aktual bisa berbeda. Selalu bandingkan harga sebelum booking.
          </p>
        </Card>
      )}
    </div>
  )
}

function ChecklistTab() {
  const [checked, setChecked] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>(['h6-bulan'])
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null)

  const toggle = (id: string) => setChecked(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  const toggleFase = (id: string) => setExpanded(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const total = getAllChecklistItems().length
  const progress = Math.round((checked.length / total) * 100)

  return (
    <div>
      {/* Progress */}
      <Card className="mb-5 text-center">
        <div className="text-4xl font-black text-[#1B6B3A] mb-1">{progress}%</div>
        <div className="text-sm text-[#6b7280] mb-3">{checked.length} dari {total} item selesai</div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#1B6B3A] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </Card>

      {/* Fases */}
      <div className="space-y-3">
        {CHECKLIST_FASES.map(fase => {
          const faseChecked = fase.items.filter(i => checked.includes(i.id)).length
          const isExpanded = expanded.includes(fase.id)

          return (
            <div key={fase.id} className="bg-white rounded-2xl border border-[rgba(201,168,76,0.12)] shadow-sm overflow-hidden">
              <button
                onClick={() => toggleFase(fase.id)}
                className="w-full flex items-center justify-between p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{fase.icon}</span>
                  <div className="text-left">
                    <div className="font-bold text-[#0D4A28]">{fase.label}</div>
                    <div className="text-xs text-[#6b7280]">{fase.waktu}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#1B6B3A]">
                    {faseChecked}/{fase.items.length}
                  </span>
                  {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-50 divide-y divide-gray-50">
                  {fase.items.map(item => (
                    <div key={item.id}>
                      <div className="flex items-start gap-3 px-5 py-3">
                        <button onClick={() => toggle(item.id)} className="mt-0.5 flex-shrink-0">
                          {checked.includes(item.id)
                            ? <CheckCircle2 size={20} className="text-[#1B6B3A]" />
                            : <Circle size={20} className="text-gray-300" />
                          }
                        </button>
                        <div className="flex-1">
                          <span className={cn('text-sm', checked.includes(item.id) ? 'line-through text-gray-400' : 'text-[#374151]')}>
                            {item.label}
                          </span>
                        </div>
                        {item.info && (
                          <button
                            onClick={() => setExpandedInfo(expandedInfo === item.id ? null : item.id)}
                            className="text-[#C9A84C] hover:text-[#b8963d] flex-shrink-0"
                          >
                            <Info size={16} />
                          </button>
                        )}
                      </div>
                      {expandedInfo === item.id && item.info && (
                        <div className="mx-5 mb-3 p-3 bg-[#FBF7F0] rounded-xl text-xs text-[#6b7280] leading-relaxed">
                          {item.info}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ItineraryTab() {
  const [selected, setSelected] = useState<string | null>(null)
  const [expandedDay, setExpandedDay] = useState<number | null>(1)

  const template = ITINERARY_TEMPLATES.find(t => t.id === selected)

  return (
    <div>
      {!selected ? (
        <>
          <p className="text-sm text-[#6b7280] mb-5">Pilih template itinerary untuk memulai:</p>
          <div className="grid gap-4">
            {ITINERARY_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className="text-left bg-white rounded-2xl p-5 border border-[rgba(201,168,76,0.12)] shadow-sm hover:border-[#1B6B3A] hover:shadow-md transition-all"
              >
                <div className="text-2xl mb-2">{t.icon}</div>
                <div className="font-bold text-[#0D4A28] mb-1">{t.judul}</div>
                <div className="text-sm text-[#6b7280]">{t.deskripsi}</div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setSelected(null)} className="text-sm text-[#6b7280] hover:text-[#0D4A28]">← Pilih template lain</button>
            <span className="text-sm font-bold text-[#0D4A28]">{template?.judul}</span>
          </div>

          <div className="space-y-3">
            {template?.hari.map(h => (
              <div key={h.hari} className="bg-white rounded-2xl border border-[rgba(201,168,76,0.12)] shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedDay(expandedDay === h.hari ? null : h.hari)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1B6B3A] text-white flex items-center justify-center font-bold text-sm">
                      H{h.hari}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-[#0D4A28] text-sm">{h.pagi || h.siang || h.malam}</div>
                      {h.catatan && <div className="text-xs text-[#6b7280]">{h.catatan}</div>}
                    </div>
                  </div>
                  {expandedDay === h.hari ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {expandedDay === h.hari && (
                  <div className="border-t border-gray-50 p-4 space-y-2">
                    {h.pagi && <div className="flex gap-2 text-sm"><span className="text-[#C9A84C] font-semibold w-14 flex-shrink-0">Pagi</span><span className="text-[#374151]">{h.pagi}</span></div>}
                    {h.siang && <div className="flex gap-2 text-sm"><span className="text-[#C9A84C] font-semibold w-14 flex-shrink-0">Siang</span><span className="text-[#374151]">{h.siang}</span></div>}
                    {h.malam && <div className="flex gap-2 text-sm"><span className="text-[#C9A84C] font-semibold w-14 flex-shrink-0">Malam</span><span className="text-[#374151]">{h.malam}</span></div>}
                    {h.catatan && (
                      <div className="mt-2 p-3 bg-[#F5E6C8] rounded-xl text-xs text-[#8B6914]">
                        💡 {h.catatan}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
