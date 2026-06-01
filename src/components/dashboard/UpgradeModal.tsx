'use client'
import { useState } from 'react'
import { X, Crown, CheckCircle2, Copy, Check } from 'lucide-react'

interface UpgradeModalProps {
  onClose: () => void
}

const PREMIUM_FEATURES = [
  'Kalkulator biaya umroh mandiri lengkap',
  'Itinerary builder + export PDF',
  'Semua 15+ spot foto & tips detail',
  'Tracker persiapan lengkap dengan reminder',
  'Mode offline penuh (download semua konten)',
  'Update konten seumur hidup',
]

const REKENING = [
  { bank: 'BCA', no: '1234567890', nama: 'BaitGo Indonesia' },
  { bank: 'BNI', no: '0987654321', nama: 'BaitGo Indonesia' },
  { bank: 'GoPay / OVO', no: '0812-3456-7890', nama: 'BaitGo' },
]

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  const [step, setStep] = useState<'info' | 'payment' | 'confirm'>('info')
  const [copied, setCopied] = useState<string | null>(null)
  const [form, setForm] = useState({ bank: '', nama: '', bukti: '' })
  const [submitted, setSubmitted] = useState(false)

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#0D4A28] to-[#1B6B3A] p-6 rounded-t-3xl text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C] flex items-center justify-center">
              <Crown size={20} className="text-white" />
            </div>
            <div>
              <div className="font-black text-xl">Upgrade Premium</div>
              <div className="text-[#C9A84C] text-sm font-semibold">Bayar sekali, pakai seumur hidup</div>
            </div>
          </div>
          <div className="text-4xl font-black mt-3">Rp 49.000</div>
          <div className="text-white/60 text-xs mt-1">Lebih murah dari satu makan di Makkah ☕</div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-0 px-6 py-3 bg-gray-50 border-b border-gray-100">
          {['Fitur', 'Pembayaran', 'Konfirmasi'].map((s, i) => {
            const idx = ['info', 'payment', 'confirm'].indexOf(step)
            return (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${i <= idx ? 'text-[#1B6B3A]' : 'text-gray-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${i < idx ? 'bg-[#1B6B3A] text-white' : i === idx ? 'bg-[#C9A84C] text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {i < idx ? <Check size={10} /> : i + 1}
                  </div>
                  {s}
                </div>
                {i < 2 && <div className={`flex-1 h-px mx-2 ${i < idx ? 'bg-[#1B6B3A]' : 'bg-gray-200'}`} />}
              </div>
            )
          })}
        </div>

        <div className="p-6">
          {/* STEP 1 — Info Fitur */}
          {step === 'info' && (
            <>
              <h3 className="font-bold text-gray-900 mb-4">Yang kamu dapatkan:</h3>
              <div className="space-y-2.5 mb-6">
                {PREMIUM_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#1B6B3A] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#F5E6C8] rounded-2xl p-4 mb-5 text-sm text-[#8B6914]">
                <strong>💡 Tidak ada biaya langganan.</strong> Bayar sekali Rp 49.000, nikmati semua fitur premium selamanya termasuk update konten di masa mendatang.
              </div>
              <button onClick={() => setStep('payment')}
                className="w-full bg-[#C9A84C] hover:bg-[#b8963d] text-white py-3.5 rounded-2xl font-bold text-base transition-colors">
                Lanjut ke Pembayaran →
              </button>
            </>
          )}

          {/* STEP 2 — Pembayaran */}
          {step === 'payment' && (
            <>
              <h3 className="font-bold text-gray-900 mb-1">Transfer Rp 49.000 ke:</h3>
              <p className="text-xs text-gray-400 mb-4">Pilih salah satu rekening di bawah</p>

              <div className="space-y-3 mb-5">
                {REKENING.map((r, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-500 uppercase">{r.bank}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-black text-gray-900 tracking-wide">{r.no}</div>
                        <div className="text-xs text-gray-400">a/n {r.nama}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(r.no, r.bank)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${copied === r.bank ? 'bg-green-100 text-green-600' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#C9A84C]'}`}>
                        {copied === r.bank ? <><Check size={12} /> Disalin</> : <><Copy size={12} /> Salin</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600 mb-5">
                ⚠️ Pastikan transfer tepat <strong>Rp 49.000</strong>. Setelah transfer, lanjut ke langkah konfirmasi agar akun diaktifkan lebih cepat.
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('info')}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors">
                  ← Kembali
                </button>
                <button onClick={() => setStep('confirm')}
                  className="flex-1 bg-[#1B6B3A] hover:bg-[#0D4A28] text-white py-3 rounded-2xl font-bold text-sm transition-colors">
                  Sudah Transfer →
                </button>
              </div>
            </>
          )}

          {/* STEP 3 — Konfirmasi */}
          {step === 'confirm' && !submitted && (
            <>
              <h3 className="font-bold text-gray-900 mb-1">Konfirmasi Pembayaran</h3>
              <p className="text-xs text-gray-400 mb-4">Isi form ini agar kami bisa aktifkan akun premium-mu lebih cepat</p>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama di rekening pengirim</label>
                  <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                    placeholder="Nama lengkap"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1B6B3A]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Transfer via bank / e-wallet</label>
                  <select value={form.bank} onChange={e => setForm(f => ({ ...f, bank: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1B6B3A]">
                    <option value="">Pilih bank...</option>
                    {REKENING.map(r => <option key={r.bank} value={r.bank}>{r.bank}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catatan (opsional)</label>
                  <textarea value={form.bukti} onChange={e => setForm(f => ({ ...f, bukti: e.target.value }))}
                    placeholder="Nomor referensi transfer atau keterangan lain"
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1B6B3A] resize-none" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('payment')}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-2xl font-semibold text-sm hover:bg-gray-50">
                  ← Kembali
                </button>
                <button
                  onClick={() => setSubmitted(true)}
                  disabled={!form.nama || !form.bank}
                  className="flex-1 bg-[#C9A84C] hover:bg-[#b8963d] disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-2xl font-bold text-sm transition-colors">
                  Kirim Konfirmasi ✓
                </button>
              </div>
            </>
          )}

          {/* SUKSES */}
          {step === 'confirm' && submitted && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#E8F5ED] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-[#1B6B3A]" />
              </div>
              <h3 className="font-black text-xl text-gray-900 mb-2">Konfirmasi Diterima!</h3>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                Tim BaitGo akan memverifikasi pembayaranmu dan mengaktifkan akun premium dalam <strong>1×24 jam</strong> (biasanya lebih cepat).
              </p>
              <div className="bg-[#E8F5ED] rounded-2xl p-4 text-sm text-[#1B6B3A] mb-5">
                🤲 Semoga Allah memudahkan perjalanan umrohmu
              </div>
              <button onClick={onClose}
                className="w-full bg-[#1B6B3A] hover:bg-[#0D4A28] text-white py-3 rounded-2xl font-bold transition-colors">
                Kembali ke Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
