'use client'
import { useState, useEffect } from 'react'
import { Save, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Settings {
  meta_pixel_id: string
  gtm_id: string
}

export default function AdminTrackingPage() {
  const [settings, setSettings] = useState<Settings>({ meta_pixel_id: '', gtm_id: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        if (d.settings) {
          setSettings({
            meta_pixel_id: d.settings.meta_pixel_id ?? '',
            gtm_id: d.settings.gtm_id ?? '',
          })
        }
      })
      .catch(() => toast.error('Gagal memuat pengaturan'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('gagal')
      toast.success('Tersimpan! Perlu re-deploy agar aktif di semua halaman.')
    } catch {
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-[#1B6B3A] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Tracking & Analitik</h1>
        <p className="text-sm text-gray-500">Konfigurasi Meta Pixel dan Google Tag Manager</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3">
        <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700 leading-relaxed">
          <p className="font-bold mb-1">Cara kerja:</p>
          <ul className="space-y-1 list-disc list-inside text-xs">
            <li>ID disimpan ke database dan langsung aktif tanpa deploy ulang</li>
            <li>Pixel akan muncul di semua halaman termasuk homepage &amp; landing page</li>
            <li>Kosongkan untuk menonaktifkan</li>
          </ul>
        </div>
      </div>

      <div className="space-y-5 mb-8">
        {/* Meta Pixel */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center text-white font-black text-base">
              f
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Meta Pixel</h3>
              <p className="text-xs text-gray-400">Facebook / Instagram Ads tracking</p>
            </div>
            {settings.meta_pixel_id
              ? <CheckCircle2 size={18} className="text-green-500" />
              : <AlertCircle size={18} className="text-gray-300" />}
          </div>

          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pixel ID</label>
          <input
            type="text"
            value={settings.meta_pixel_id}
            onChange={e => setSettings(s => ({ ...s, meta_pixel_id: e.target.value.trim() }))}
            placeholder="123456789012345"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 font-mono transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            Meta Business Manager → Events Manager → Pixel → ID
          </p>

          {settings.meta_pixel_id && (
            <div className="mt-3 p-3 bg-green-50 rounded-xl text-xs text-green-700 space-y-1">
              <p className="font-bold">Events yang akan dikirim otomatis:</p>
              <div className="grid grid-cols-2 gap-1 mt-1">
                <div className="bg-white/60 rounded px-2 py-1"><code>PageView</code> — semua halaman</div>
                <div className="bg-white/60 rounded px-2 py-1"><code>ViewContent</code> — homepage & LP</div>
                <div className="bg-white/60 rounded px-2 py-1"><code>InitiateCheckout</code> — daftar berhasil</div>
                <div className="bg-white/60 rounded px-2 py-1"><code>Purchase</code> — bayar berhasil</div>
              </div>
            </div>
          )}
        </div>

        {/* GTM */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#4285F4] flex items-center justify-center text-white font-bold text-xs">
              GTM
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Google Tag Manager</h3>
              <p className="text-xs text-gray-400">Manajemen semua tag & pixel terpusat</p>
            </div>
            {settings.gtm_id
              ? <CheckCircle2 size={18} className="text-green-500" />
              : <AlertCircle size={18} className="text-gray-300" />}
          </div>

          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Container ID</label>
          <input
            type="text"
            value={settings.gtm_id}
            onChange={e => setSettings(s => ({ ...s, gtm_id: e.target.value.trim() }))}
            placeholder="GTM-XXXXXXX"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 font-mono transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            tagmanager.google.com → pilih Container → Container ID (GTM-XXXXXXX)
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={cn(
          'flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-base transition-all',
          saving ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 text-white'
        )}
      >
        <Save size={16} />
        {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
      </button>
    </div>
  )
}
