'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password minimal 6 karakter'); return }
    setLoading(true)

    // Buat user via server route
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone }),
    })
    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error || 'Gagal mendaftar')
      setLoading(false)
      return
    }

    // Login otomatis setelah berhasil daftar
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    if (result?.error) {
      toast.success('Akun berhasil dibuat! Silakan login.')
      router.push('/auth/login')
      return
    }

    toast.success('Bismillah! Selamat datang di Umrava 🕋')

    if (typeof window !== 'undefined' && (window as Window & { fbq?: Function }).fbq) {
      (window as Window & { fbq?: Function }).fbq?.('track', 'InitiateCheckout', {
        content_name: 'Umrava Premium',
        value: 49000,
        currency: 'IDR',
      })
    }

    router.push('/dashboard')
    setLoading(false)
  }

  const handleGoogle = async () => {
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col items-center justify-center p-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D4A28 0%, #1B6B3A 60%, #2D8A52 100%)' }}
      >
        <div className="absolute inset-0 arabesque-pattern opacity-30" />
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-6">🕋</div>
          <h1 className="text-4xl font-black mb-2">Umrava</h1>
          <p className="text-[#C9A84C] text-lg font-medium mb-8">Mulai persiapan umrohmu</p>

          <div className="space-y-4 text-left">
            {[
              { icon: '📖', text: 'Al-Quran 114 surah + terjemah + murottal' },
              { icon: '🧭', text: 'Kompas kiblat real-time + kalender Hijriah' },
              { icon: '🤲', text: 'Bank doa umroh dengan audio Arab' },
              { icon: '🕌', text: 'Panduan ibadah step-by-step lengkap' },
              { icon: '✅', text: 'Tracker & checklist persiapan' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>

          <p className="mt-6 text-[#C9A84C] text-sm font-semibold">✅ Gratis untuk fitur utama</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#FBF7F0]">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="text-4xl mb-2">🕋</div>
            <h1 className="text-2xl font-black text-[#0D4A28]">Umrava</h1>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-[rgba(201,168,76,0.12)]">
            <h2 className="text-2xl font-bold text-[#0D4A28] mb-1">Mulai Persiapan — Gratis</h2>
            <p className="text-[#6b7280] text-sm mb-6">Buat akun Umrava, tidak perlu kartu kredit</p>

            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 text-sm font-semibold text-[#374151] hover:border-[#C9A84C] hover:bg-[#FFFDF5] transition-all mb-5"
            >
              <svg width="20" height="20" viewBox="0 0 20 20"><path d="M19.8 10.22c0-.71-.06-1.39-.18-2.04H10.2v3.86h5.39c-.23 1.24-.93 2.29-1.98 2.99v2.48h3.2c1.87-1.72 2.95-4.25 2.95-7.29z" fill="#4285F4"/><path d="M10.2 20c2.7 0 4.96-.9 6.61-2.43l-3.2-2.48c-.9.6-2.04.95-3.41.95-2.62 0-4.84-1.77-5.63-4.15H1.26v2.56C2.9 17.74 6.3 20 10.2 20z" fill="#34A853"/><path d="M4.57 11.89A5.99 5.99 0 014.25 10c0-.65.11-1.29.32-1.89V5.55H1.26A10.01 10.01 0 000 10c0 1.61.39 3.14 1.26 4.45l3.31-2.56z" fill="#FBBC05"/><path d="M10.2 3.96c1.48 0 2.8.51 3.84 1.5l2.87-2.87C15.15.99 12.9 0 10.2 0 6.3 0 2.9 2.26 1.26 5.55l3.31 2.56c.79-2.38 3.01-4.15 5.63-4.15z" fill="#EA4335"/></svg>
              Daftar dengan Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">atau</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Nama Lengkap</label>
                <input
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  placeholder="Ahmad Rifai"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B6B3A] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Email</label>
                <input
                  type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                  placeholder="email@contoh.com"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B6B3A] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  No. WhatsApp <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium select-none">+62</span>
                  <input
                    type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                    placeholder="8123456789"
                    className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#1B6B3A] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Password</label>
                <input
                  type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
                  placeholder="Minimal 6 karakter"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B6B3A] transition-colors"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-[#1B6B3A] hover:bg-[#0D4A28] disabled:bg-gray-300 text-white py-3.5 rounded-xl font-bold text-base transition-colors"
              >
                {loading ? 'Mendaftar...' : 'Mulai Persiapan — Gratis 🕌'}
              </button>
            </form>

            <p className="text-xs text-center text-[#6b7280] mt-4">
              Dengan mendaftar, Anda menyetujui{' '}
              <Link href="/syarat-ketentuan" className="text-[#1B6B3A] underline">Syarat & Ketentuan</Link> Umrava
            </p>

            <p className="text-center text-sm text-[#6b7280] mt-4">
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="text-[#1B6B3A] font-semibold hover:underline">Masuk</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
