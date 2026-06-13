'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Crown, Check, Loader2, Copy, Clock,
  RefreshCw, ExternalLink, Star, CheckCircle2,
  Shield, Zap, Menu, X, ChevronDown, ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSession, signIn } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { LandingDashboardPreview } from '@/components/landing/LandingDashboardPreview'
import { PixelViewContent } from '@/components/analytics/PixelViewContent'
import type { PaymentChannel, PaymentTransaction } from '@/lib/duitku'

// ─── Data ─────────────────────────────────────────────────────────────────────

const FITUR = [
  {
    badge: 'Ibadah Lebih Khusyuk',
    icon: '🕌',
    judul: 'Panduan ibadah & zikir lengkap dengan audio Arab',
    deskripsi: 'Dari niat ihram sampai tahallul, semua ada panduannya. Counter tawaf dan sa\'i otomatis, doa lengkap tiap tahap, serta Zikir Pagi & Petang Al-Banna dengan counter dan audio — bisa diputar bahkan saat layar mati.',
    benefits: ['Counter tawaf & sa\'i otomatis', 'Zikir Pagi & Petang Al-Banna', 'Audio doa bisa background play', 'Teks Arab besar & jelas'],
    emoji: '🤲',
  },
  {
    badge: 'Al-Quran Lengkap',
    icon: '📖',
    judul: 'Baca Al-Quran 114 surah dengan murottal Mishary',
    deskripsi: 'Al-Quran lengkap dengan terjemah bahasa Indonesia dan audio murottal Mishary Rashid Alafasy per ayat. Fitur pencarian kata kunci di seluruh Al-Quran dan mode malam untuk membaca nyaman kapan saja.',
    benefits: ['114 surah + terjemah Indonesia', 'Audio murottal Mishary per ayat', 'Pencarian kata di seluruh Quran', 'Mode malam & ukuran font fleksibel'],
    emoji: '📖',
  },
  {
    badge: 'Navigasi Sempurna',
    icon: '🧭',
    judul: 'Kompas kiblat real-time, jadwal shalat & kalender Hijriah',
    deskripsi: 'Kompas kiblat berbasis GPS dari posisi Anda saat ini, jadwal shalat 5 waktu dengan countdown otomatis, serta penanggalan Masehi dan Hijriah secara bersamaan — tahu tanggal Islam setiap saat di mana pun berada.',
    benefits: ['Kompas GPS real-time', 'Jadwal shalat + countdown', 'Kalender Hijriah otomatis', 'Jarak ke Makkah'],
    emoji: '🧭',
  },
  {
    badge: 'Persiapan Matang',
    icon: '🧳',
    judul: 'Packing list cerdas & tracker persiapan yang tidak melewatkan apapun',
    deskripsi: '57 item packing list terorganisir dengan saran cerdas berdasarkan waktu keberangkatan, dilengkapi tracker persiapan dari H-6 bulan sampai H-1 hari, serta kalkulator biaya umroh mandiri yang komprehensif.',
    benefits: ['57 item packing + saran AI', 'Tracker persiapan per fase', 'Kalkulator biaya mandiri', 'Countdown keberangkatan'],
    emoji: '📋',
  },
  {
    badge: 'Di Tanah Suci',
    icon: '💱',
    judul: 'Konversi mata uang SAR real-time & panduan praktis',
    deskripsi: 'Kalkulator kurs Riyal Saudi ↔ Rupiah yang selalu diperbarui, referensi harga umum di Saudi Arabia, serta panduan praktis transportasi, darurat, belanja, dan teknologi untuk umroh mandiri.',
    benefits: ['Kurs SAR ↔ IDR real-time', 'Referensi harga Saudi Arabia', 'Panduan transportasi & darurat', 'Tips belanja Tanah Suci'],
    emoji: '💱',
  },
]

const TESTIMONIALS = [
  { featured: true, quote: 'Saya umroh pertama kali tanpa travel agent di usia 55 tahun. Dengan Umrava saya benar-benar siap. Panduan doanya yang paling membantu — saya bisa dengarkan audio sambil tawaf tanpa harus baca layar. Tawaf 7 putaran lancar tanpa missed satu doa pun. Alhamdulillah.', name: 'Pak Hendra', detail: '55 tahun · Umroh Mandiri dari Bandung' },
  { quote: 'Kompas kiblatnya luar biasa! Di hotel yang membingungkan arahnya, langsung buka Umrava dan shalat dengan tenang.', name: 'Bu Sari', detail: '42 tahun · Bogor' },
  { quote: 'Al-Qurannya lengkap — terjemah dan audio Mishary. Saya baca tiap malam sebelum tidur sambil persiapkan diri.', name: 'Mas Danu', detail: '31 tahun · Yogyakarta' },
  { quote: 'Kalkulator biayanya sangat membantu. Kami siapkan budget yang tepat — tidak ada kaget-kagetan saat di sana.', name: 'Pak & Bu Ridwan', detail: 'Surabaya' },
]

const PREMIUM_FEATURES = [
  'Al-Quran 114 surah + murottal Mishary per ayat',
  'Panduan ibadah step-by-step + counter tawaf/sa\'i',
  'Zikir Pagi & Petang Al-Banna (15 zikir + counter)',
  'Bank doa 20+ doa + audio Arab',
  'Kompas kiblat GPS + kalender Hijriah',
  'Jadwal shalat 5 waktu + countdown',
  'Smart packing list 57 item',
  'Tracker persiapan + kalkulator biaya',
  'Konversi SAR ↔ IDR real-time',
  'Spot foto 15+ lokasi Makkah & Madinah',
  'Panduan praktis Tanah Suci',
  'Semua update fitur tanpa biaya tambahan',
]

const FAQ_LP = [
  { q: 'Apa saja yang ada di Umrava Premium?', a: 'Semua yang Anda butuhkan untuk umroh: Al-Quran 114 surah dengan murottal Mishary, panduan ibadah lengkap, zikir pagi & petang, kompas kiblat, jadwal shalat, packing list cerdas, kalkulator biaya, hingga spot foto terbaik di Tanah Suci. Satu platform, satu harga.' },
  { q: 'Apakah ini bayar sekali atau berlangganan?', a: 'Sekali bayar Rp49.000 — akses seumur hidup. Tidak ada biaya bulanan atau tahunan. Termasuk semua update fitur di masa mendatang tanpa biaya tambahan.' },
  { q: 'Berapa lama aktivasi setelah pembayaran?', a: 'Otomatis dalam hitungan menit setelah pembayaran terverifikasi. Anda langsung bisa mengakses semua fitur premium.' },
  { q: 'Bisa digunakan di banyak perangkat?', a: 'Ya. Login dengan akun yang sama di HP, tablet, atau komputer mana saja tanpa biaya tambahan.' },
  { q: 'Bagaimana jika saya sudah punya akun Umrava?', a: 'Login dengan akun Anda, lalu buka halaman Upgrade di dashboard — prosesnya sama dengan pendaftaran baru.' },
]

const BANK_CONFIG: Record<string, { bg: string; text: string; abbr: string }> = {
  BRIVA: { bg: '#015198', text: '#fff', abbr: 'BRI' },
  BNIVA: { bg: '#F26522', text: '#fff', abbr: 'BNI' },
  BSIVA: { bg: '#2E7D32', text: '#fff', abbr: 'BSI' },
  MANDIRIVA: { bg: '#003087', text: '#FFD100', abbr: 'MANDIRI' },
  BCAVA: { bg: '#005BAA', text: '#fff', abbr: 'BCA' },
  QRIS: { bg: '#E30613', text: '#fff', abbr: 'QRIS' },
  QRISC: { bg: '#E30613', text: '#fff', abbr: 'QRIS' },
  DANA: { bg: '#118EEA', text: '#fff', abbr: 'DANA' },
  OVO: { bg: '#4C3494', text: '#fff', abbr: 'OVO' },
  GOPAY: { bg: '#00AED6', text: '#fff', abbr: 'GoPay' },
}

const AMOUNT = 49000
const LP_TX_KEY = 'umrava_pending_tx'
type Step = 'landing' | 'register' | 'payment' | 'instructions' | 'success'

function formatRp(n: number) { return `Rp${n.toLocaleString('id-ID')}` }
function formatCountdown(unix: number) {
  const diff = unix * 1000 - Date.now()
  if (diff <= 0) return '00:00:00'
  const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all', copied ? 'bg-green-100 text-green-700' : 'bg-[#E8F5ED] text-[#1B6B3A] hover:bg-[#1B6B3A] hover:text-white')}>
      {copied ? <Check size={12} /> : <Copy size={12} />}{copied ? 'Tersalin!' : 'Salin'}
    </button>
  )
}

function BankLogo({ code, iconUrl }: { code: string; iconUrl?: string }) {
  if (iconUrl) return (
    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden p-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={iconUrl} alt={code} className="w-full h-full object-contain" />
    </div>
  )
  const cfg = BANK_CONFIG[code]
  if (!cfg) return <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">💳</div>
  return (
    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs text-center flex-shrink-0 shadow-sm"
      style={{ background: cfg.bg, color: cfg.text, fontSize: cfg.abbr.length > 4 ? '9px' : '11px' }}>
      {cfg.abbr}
    </div>
  )
}

// ─── LP FAQ Component ──────────────────────────────────────────────────────────

function LPFAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-2">
      {FAQ_LP.map((faq, i) => (
        <div key={i} className="bg-white rounded-2xl border border-[rgba(201,168,76,0.12)] overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left gap-3">
            <span className="font-semibold text-sm text-[#0D4A28]">{faq.q}</span>
            {open === i ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
          </button>
          {open === i && <div className="px-6 pb-4 text-sm text-[#6b7280] leading-relaxed border-t border-gray-50 pt-3">{faq.a}</div>}
        </div>
      ))}
    </div>
  )
}

// ─── LP Nav ───────────────────────────────────────────────────────────────────

function LPNav({ onCTA }: { onCTA: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <nav className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4',
        scrolled ? 'bg-[#0D4A28]/98 shadow-lg backdrop-blur-sm' : 'bg-[#0D4A28]')}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-white font-black text-xl">
            <span className="text-2xl">🕋</span> Umrava
            <span className="hidden sm:inline text-xs font-normal text-[#C9A84C] border border-[#C9A84C]/30 px-2 py-0.5 rounded-full">Premium</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-[rgba(251,247,240,0.7)]">
            <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
            <a href="#testimonial" className="hover:text-white transition-colors">Testimoni</a>
            <a href="#harga" className="hover:text-white transition-colors">Harga</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link href="/auth/login" className="hover:text-white transition-colors">Sudah punya akun?</Link>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onCTA}
              className="bg-[#C9A84C] hover:bg-[#b8963d] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all hidden sm:block">
              Aktifkan Premium
            </button>
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-white p-1">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-72 bg-[#0D4A28] z-50 p-6">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white">
              <X size={20} />
            </button>
            <div className="text-white font-black text-xl mb-8 flex items-center gap-2"><span>🕋</span> Umrava</div>
            <div className="space-y-4 text-[rgba(251,247,240,0.7)] text-sm">
              {[{ href: '#fitur', label: 'Fitur' }, { href: '#testimonial', label: 'Testimoni' }, { href: '#harga', label: 'Harga' }, { href: '#faq', label: 'FAQ' }].map(item => (
                <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block hover:text-white transition-colors">{item.label}</a>
              ))}
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block hover:text-white transition-colors">Sudah punya akun?</Link>
            </div>
            <button onClick={() => { onCTA(); setMobileOpen(false) }}
              className="w-full mt-8 bg-[#C9A84C] text-white py-3.5 rounded-2xl font-bold transition-all">
              Aktifkan Premium
            </button>
          </div>
        </>
      )}
    </>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LPPremiumPage() {
  const router = useRouter()
  const { data: sessionData } = useSession()
  const [step, setStep] = useState<Step>('landing')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [authLoading, setAuthLoading] = useState(false)
  const [channels, setChannels] = useState<PaymentChannel[]>([])
  const [channelsLoading, setChannelsLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('')
  const [creating, setCreating] = useState(false)
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null)
  const [countdown, setCountdown] = useState('')
  const [checking, setChecking] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  // Ref to signal "pending VA exists" — set by restore effect before sessionData resolves
  const hasPendingTxRef = useRef(false)

  // Restore pending transaction from sessionStorage (client-only — runs before sessionData resolves)
  useEffect(() => {
    const raw = sessionStorage.getItem(LP_TX_KEY)
    if (!raw) return
    try {
      const { transaction: tx } = JSON.parse(raw) as { transaction: PaymentTransaction }
      if (tx?.expired_time * 1000 > Date.now()) {
        hasPendingTxRef.current = true
        setTransaction(tx)
        setStep('instructions')
      } else {
        sessionStorage.removeItem(LP_TX_KEY)
      }
    } catch {
      sessionStorage.removeItem(LP_TX_KEY)
    }
  }, [])

  useEffect(() => {
    if (!sessionData) return
    if (sessionData.user) {
      // Don't override instructions step — user has a pending VA in sessionStorage
      if (hasPendingTxRef.current) return
      // Check plan via API
      fetch('/api/user/profile').then(r => r.json()).then(({ profile }) => {
        if (profile?.plan === 'premium') { router.push('/dashboard'); return }
        setStep('payment')
        loadChannels()
      }).catch(() => {
        setStep('payment')
        loadChannels()
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData])

  const loadChannels = useCallback(async () => {
    setChannelsLoading(true)
    try {
      const res = await fetch('/api/payment/channels')
      const d = await res.json()
      if (d.channels?.length > 0) setChannels(d.channels)
    } catch { /* ignore */ }
    finally { setChannelsLoading(false) }
  }, [])

  useEffect(() => {
    if (!transaction?.expired_time) return
    const id = setInterval(() => setCountdown(formatCountdown(transaction.expired_time)), 1000)
    setCountdown(formatCountdown(transaction.expired_time))
    return () => clearInterval(id)
  }, [transaction?.expired_time])

  const checkStatus = useCallback(async () => {
    if (!transaction?.merchantOrderId) return
    setChecking(true)
    try {
      const res = await fetch(`/api/payment/status?orderId=${transaction.merchantOrderId}`)
      const d = await res.json()
      if (d.statusCode === '00') {
        sessionStorage.removeItem(LP_TX_KEY)
        setStep('success')
        clearInterval(intervalRef.current!)
        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'Purchase', { value: AMOUNT, currency: 'IDR', content_name: 'Umrava Premium' })
        }
      } else if (d.statusCode === '02') {
        sessionStorage.removeItem(LP_TX_KEY)
      }
    } catch { /* ignore */ }
    finally { setChecking(false) }
  }, [transaction?.reference])

  useEffect(() => {
    if (step !== 'instructions') { if (intervalRef.current) clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(checkStatus, 30000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [step, checkStatus])

  const goToRegister = () => {
    setStep('register')
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password minimal 6 karakter'); return }
    setAuthLoading(true)
    try {
      // Coba register via API route
      const regRes = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const regData = await regRes.json()

      if (!regRes.ok && regData.error !== 'Email sudah terdaftar, silakan login') {
        toast.error(regData.error || 'Gagal mendaftar'); return
      }

      // Login dengan credentials
      const result = await signIn('credentials', {
        email: form.email, password: form.password, redirect: false,
      })
      if (result?.error) { toast.error('Email atau password salah'); return }

      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'InitiateCheckout', { value: 49000, currency: 'IDR', content_name: 'Umrava Premium' })
      }
      setStep('payment'); loadChannels()
    } finally { setAuthLoading(false) }
  }

  const selectedChannel = channels.find(c => c.code === selectedMethod)
  const fee = selectedChannel?.totalFee ?? 0
  const total = AMOUNT + fee

  const handleCreateTransaction = async () => {
    if (!selectedMethod) { toast.error('Pilih metode pembayaran terlebih dahulu'); return }
    setCreating(true)
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddPaymentInfo', { value: AMOUNT, currency: 'IDR', content_name: 'Umrava Premium', payment_type: selectedMethod })
    }
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: selectedMethod }),
      })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      sessionStorage.setItem(LP_TX_KEY, JSON.stringify({ transaction: d.transaction }))
      setTransaction(d.transaction)
      setStep('instructions')
    } catch (e) {
      toast.error((e as Error).message)
    } finally { setCreating(false) }
  }

  const groupedChannels = (() => {
    const g: Record<string, { code: string; name: string; fee: number; iconUrl?: string }[]> = {}
    channels.forEach(ch => {
      if (!g[ch.group]) g[ch.group] = []
      g[ch.group].push({ code: ch.code, name: ch.name, fee: ch.totalFee ?? 0, iconUrl: ch.icon_url })
    })
    return Object.entries(g).map(([name, methods]) => ({ name, methods }))
  })()

  const isQRIS = transaction?.payment_method_code?.toUpperCase() === 'QR'
  const isStore = ['A1', 'I1', 'FT'].includes(transaction?.payment_method_code?.toUpperCase() ?? '')
  const isVA = !!transaction?.pay_code && !isQRIS && !isStore

  // ── LANDING ──────────────────────────────────────────────────────────────────
  if (step === 'landing') return (
    <div className="bg-[#FBF7F0] min-h-screen">
      <PixelViewContent contentName="Umrava Premium Landing Page" />
      <LPNav onCTA={goToRegister} />

      {/* HERO */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern" />
        <div className="absolute top-20 left-10 text-5xl opacity-20 animate-float-slow">✦</div>
        <div className="absolute top-40 right-16 text-3xl opacity-15 animate-float-slow" style={{ animationDelay: '2s' }}>✦</div>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F5E6C8] text-[#8B6914] rounded-full px-5 py-2 text-sm font-semibold mb-8 border border-[rgba(201,168,76,0.3)]">
            <Crown size={14} /> Al-Quran · Panduan Ibadah · Zikir · Kompas Kiblat — dalam satu platform
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#0D4A28] leading-tight mb-6 max-w-4xl mx-auto">
            Setiap langkah di Tanah Suci adalah momen yang{' '}
            <span className="text-[#C9A84C]">tak akan terulang.</span>{' '}
            Pastikan Anda siap.
          </h1>
          <p className="text-lg text-[#6b7280] max-w-2xl mx-auto mb-10 leading-relaxed">
            Umrava menemani perjalanan umroh Anda dari persiapan sampai kepulangan — panduan ibadah, Al-Quran dengan murottal, kompas kiblat, zikir harian, jadwal shalat, hingga kalkulator biaya mandiri.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <button onClick={goToRegister}
              className="bg-[#1B6B3A] hover:bg-[#0D4A28] text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:-translate-y-1 shadow-lg shadow-[#1B6B3A]/25">
              Aktifkan Umrava Premium 🕌
            </button>
            <a href="#fitur" className="flex items-center gap-2 text-[#1B6B3A] font-semibold hover:text-[#0D4A28] transition-colors text-sm">
              <span className="w-8 h-8 rounded-full bg-[#E8F5ED] flex items-center justify-center">
                <ChevronDown size={14} />
              </span>
              Lihat fitur lengkap
            </a>
          </div>
          <p className="text-sm text-[#6b7280]">Sekali bayar Rp49.000 · Akses seumur hidup · Tidak ada biaya berulang</p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex -space-x-2">
              {['👴', '👩', '👨', '👵', '🧕'].map((emoji, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-[#E8F5ED] border-2 border-[#FBF7F0] flex items-center justify-center text-sm">{emoji}</div>
              ))}
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-[#0D4A28]">Dipercaya 15.000+ calon jamaah Indonesia</div>
              <div className="flex items-center gap-1 text-xs text-[#6b7280]">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-[#C9A84C] fill-[#C9A84C]" />)}
                <span>4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-[#0D4A28] mb-2">Lihat Umrava beraksi</h2>
            <p className="text-[#6b7280]">Semua yang Anda butuhkan untuk umroh yang lebih bermakna</p>
          </div>
          <LandingDashboardPreview />
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6 bg-[#F5E6C8]/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-[#0D4A28] text-center mb-3">Umroh adalah perjalanan sekali seumur hidup.</h2>
          <p className="text-center text-[#6b7280] mb-12">Jangan sampai ada yang terlewat karena kurang persiapan.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '📖', judul: 'Panduan ibadah & doa tersebar di mana-mana', deskripsi: 'Buku manasik, video, artikel yang kadang bertentangan. Di Tanah Suci, panik karena tidak yakin doa mana yang benar untuk putaran ke-3 tawaf.' },
              { icon: '🧭', judul: 'Bingung arah kiblat dan tanggal Hijriah', deskripsi: 'Di hotel baru, ke arah mana shalat? Sudah memasuki bulan apa dalam kalender Hijriah? Pertanyaan sederhana yang sering mengganggu ketenangan ibadah.' },
              { icon: '💰', judul: 'Biaya umroh mandiri sulit diprediksi', deskripsi: 'Tiket, visa, hotel, transportasi, makan, oleh-oleh — berapa total yang harus disiapkan? Sering kaget saat di sana karena tidak ada perencanaan yang matang.' },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(201,168,76,0.12)]">
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="font-bold text-[#0D4A28] mb-2">{p.judul}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{p.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ayat */}
      <section className="py-16 px-6 bg-[#0D4A28] text-center text-white">
        <div className="text-4xl mb-4" style={{ fontFamily: "'Amiri', serif", direction: 'rtl', lineHeight: 2 }}>
          وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ
        </div>
        <p className="text-[#C9A84C] text-lg font-medium mb-2">&quot;Dan sempurnakanlah ibadah haji dan umrah karena Allah&quot;</p>
        <p className="text-[rgba(251,247,240,0.6)] text-sm mb-6">(QS. Al-Baqarah: 196)</p>
        <p className="text-[#F5E6C8] font-medium">Umrava hadir untuk membantu Anda menyempurnakan setiap momennya.</p>
      </section>

      {/* Fitur */}
      <section id="fitur" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-[#0D4A28] mb-2">Teman setia dari persiapan sampai kepulangan</h2>
            <p className="text-[#6b7280]">Semua yang Anda butuhkan, dalam satu platform</p>
          </div>
          <div className="space-y-16">
            {FITUR.map((f, i) => (
              <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center`}>
                <div className="flex-1">
                  <Badge variant="green" className="mb-4">{f.badge}</Badge>
                  <h3 className="text-2xl font-black text-[#0D4A28] mb-4 leading-tight">{f.judul}</h3>
                  <p className="text-[#6b7280] leading-relaxed mb-6">{f.deskripsi}</p>
                  <div className="space-y-2">
                    {f.benefits.map((b, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-[#374151]">
                        <CheckCircle2 size={16} className="text-[#1B6B3A] flex-shrink-0" />{b}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-72 h-72 bg-gradient-to-br from-[#E8F5ED] to-[#F5E6C8] rounded-3xl flex items-center justify-center shadow-lg border border-[rgba(201,168,76,0.2)]">
                    <span className="text-8xl">{f.emoji}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonial" className="py-20 px-6 bg-[#F5E6C8]/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0D4A28] mb-2">Kata mereka yang sudah terbantu Umrava</h2>
            <p className="text-[#6b7280]">15.000+ calon jamaah sudah lebih siap dengan Umrava</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="md:col-span-1 bg-[#0D4A28] text-white rounded-2xl p-6">
              <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-[#C9A84C] fill-[#C9A84C]" />)}</div>
              <p className="text-sm leading-relaxed text-[rgba(251,247,240,0.9)] mb-5">&quot;{TESTIMONIALS[0].quote}&quot;</p>
              <div className="font-bold text-[#C9A84C]">{TESTIMONIALS[0].name}</div>
              <div className="text-xs text-[rgba(251,247,240,0.6)]">{TESTIMONIALS[0].detail}</div>
            </div>
            <div className="md:col-span-2 grid gap-4">
              {TESTIMONIALS.slice(1).map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-[rgba(201,168,76,0.12)] shadow-sm">
                  <div className="flex gap-1 mb-3">{[...Array(5)].map((_, j) => <Star key={j} size={12} className="text-[#C9A84C] fill-[#C9A84C]" />)}</div>
                  <p className="text-sm text-[#374151] leading-relaxed mb-3">&quot;{t.quote}&quot;</p>
                  <div className="font-bold text-[#0D4A28] text-sm">{t.name}</div>
                  <div className="text-xs text-[#6b7280]">{t.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Harga */}
      <section id="harga" className="py-20 px-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0D4A28] mb-2">Investasi kecil untuk perjalanan tak ternilai</h2>
            <p className="text-[#6b7280]">Bayar sekali, pakai seumur hidup</p>
          </div>
          <div className="bg-[#0D4A28] rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#C9A84C] text-white text-xs font-bold px-4 py-2 rounded-bl-2xl">TERLARIS</div>
            <div className="text-sm font-bold text-[#C9A84C] mb-1">Umrava Premium — Akses Seumur Hidup</div>
            <div className="text-5xl font-black mb-1">Rp49.000</div>
            <p className="text-[rgba(251,247,240,0.5)] text-xs mb-7">Lebih murah dari satu makan siang di Makkah ☕</p>
            <div className="grid sm:grid-cols-2 gap-2 mb-8">
              {PREMIUM_FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-[rgba(251,247,240,0.85)]">
                  <CheckCircle2 size={15} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />{f}
                </div>
              ))}
            </div>
            <button onClick={goToRegister}
              className="block w-full text-center bg-[#C9A84C] hover:bg-[#b8963d] text-white py-4 rounded-2xl font-bold text-base transition-all">
              Aktifkan Premium — Rp49.000 ✨
            </button>
            <div className="mt-5 pt-5 border-t border-white/10">
              <p className="text-xs text-white/40 text-center mb-2">Tersedia pembayaran via</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {['Virtual Account', 'QRIS', 'Alfamart', 'Indomaret', 'E-Wallet'].map(m => (
                  <span key={m} className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{m}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-[#6b7280]"><Shield size={15} className="text-green-500" /> Pembayaran aman via Duitku</div>
            <div className="flex items-center gap-1.5 text-sm text-[#6b7280]"><Zap size={15} className="text-yellow-500" /> Aktivasi instan</div>
            <div className="flex items-center gap-1.5 text-sm text-[#6b7280]"><RefreshCw size={15} className="text-blue-500" /> Update seumur hidup</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 px-6 bg-[#F5E6C8]/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-[#0D4A28] text-center mb-10">Pertanyaan Umum</h2>
          <LPFAQ />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D4A28 0%, #1B6B3A 100%)' }}>
        <div className="absolute inset-0 arabesque-pattern opacity-20" />
        <div className="relative max-w-2xl mx-auto text-center text-white">
          <div className="text-5xl mb-6">🕋</div>
          <h2 className="text-4xl font-black mb-3">Semoga umrohnya mabrur.</h2>
          <p className="text-[rgba(251,247,240,0.8)] text-lg mb-8">Persiapan yang baik adalah bagian dari ikhtiar yang terbaik.</p>
          <button onClick={goToRegister}
            className="inline-block bg-[#C9A84C] hover:bg-[#b8963d] text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:-translate-y-1 shadow-xl">
            Aktifkan Umrava Premium 🕌
          </button>
          <p className="text-[rgba(251,247,240,0.5)] text-sm mt-4">Sekali bayar Rp49.000 · Akses seumur hidup</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D4A28] text-white py-8 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
            <div className="flex items-center gap-3 font-black text-lg">
              <span className="text-2xl">🕋</span> Umrava
              <span className="text-[#C9A84C] text-xs font-normal">Panduan Umroh</span>
            </div>
            <div className="flex flex-col gap-1.5 text-sm text-[rgba(251,247,240,0.6)]">
              <p className="font-semibold text-[#C9A84C] text-xs uppercase tracking-wide">Kontak Support</p>
              <a href="mailto:info@umrava.com" className="flex items-center gap-2 hover:text-white transition-colors">📧 info@umrava.com</a>
              <a href="https://wa.me/6281313585848" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">📱 081313585848</a>
              <p className="flex items-start gap-2">📍 Perumahan Pilar Biru Blok Pilar Utara, Bandung</p>
            </div>
            <div className="flex gap-5 text-sm text-[rgba(251,247,240,0.5)]">
              <Link href="/syarat-ketentuan" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
              <Link href="/kebijakan-privasi" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
            </div>
          </div>
          <p className="text-xs text-[rgba(251,247,240,0.3)] border-t border-white/10 pt-4">© 2026 Umrava. Teman setia perjalanan umrohmu.</p>
        </div>
      </footer>
    </div>
  )

  // ── REGISTER ──────────────────────────────────────────────────────────────────
  if (step === 'register') return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center px-5 py-12">
      <div ref={formRef} className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🕋</div>
          <h1 className="text-2xl font-black text-[#0D4A28] mb-1">Buat akun Umrava</h1>
          <p className="text-gray-500 text-sm">Langkah pertama menuju persiapan umroh yang lebih baik</p>
        </div>
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-[rgba(201,168,76,0.12)]">
          <div className="bg-gradient-to-r from-[#1B6B3A] to-[#0D4A28] rounded-2xl p-4 text-white mb-6 flex items-center justify-between">
            <div>
              <p className="text-[#C9A84C] text-xs font-bold mb-0.5">Umrava Premium</p>
              <p className="text-2xl font-black">Rp49.000</p>
              <p className="text-white/50 text-xs">Sekali bayar · Seumur hidup</p>
            </div>
            <Crown size={36} className="text-[#C9A84C]" />
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Lengkap</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                placeholder="Ahmad Rifai"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B6B3A] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                placeholder="email@contoh.com"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B6B3A] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
                placeholder="Minimal 6 karakter"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B6B3A] transition-colors" />
            </div>
            <button type="submit" disabled={authLoading}
              className="w-full bg-[#C9A84C] hover:bg-[#b8963d] disabled:bg-gray-200 text-white py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2">
              {authLoading ? <><Loader2 size={16} className="animate-spin" /> Memproses...</> : 'Lanjut ke Pembayaran →'}
            </button>
          </form>
          <p className="text-xs text-center text-gray-400 mt-4">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-[#1B6B3A] font-semibold hover:underline">Masuk di sini</Link>
          </p>
          <button onClick={() => setStep('landing')} className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600">
            ← Kembali ke halaman sebelumnya
          </button>
        </div>
      </div>
    </div>
  )

  // ── PAYMENT ──────────────────────────────────────────────────────────────────
  if (step === 'payment') return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-start justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-xl font-black text-[#0D4A28] mb-1 flex items-center justify-center gap-2">
            <Crown size={20} className="text-[#C9A84C]" /> Pilih Metode Pembayaran
          </h1>
          <p className="text-gray-500 text-sm">Umrava Premium · Rp49.000 · Akses seumur hidup</p>
        </div>
        {channelsLoading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 size={24} className="animate-spin text-[#1B6B3A]" />
            <p className="text-sm text-gray-400">Memuat metode pembayaran...</p>
          </div>
        ) : (
          <div className="space-y-5 mb-5">
            {groupedChannels.map(group => (
              <div key={group.name}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{group.name}</p>
                <div className="space-y-2">
                  {group.methods.map(m => (
                    <button key={m.code} onClick={() => setSelectedMethod(m.code)}
                      className={cn('w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left',
                        selectedMethod === m.code
                          ? 'border-[#C9A84C] bg-[#FFFBF0] shadow-md ring-2 ring-[#C9A84C]/20'
                          : 'border-gray-100 bg-white hover:border-[#C9A84C]/50')}>
                      <BankLogo code={m.code} iconUrl={m.iconUrl} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{m.name}</p>
                        {m.fee > 0
                          ? <p className="text-xs text-gray-400">+ biaya admin Rp{m.fee.toLocaleString('id-ID')}</p>
                          : <p className="text-xs text-green-600 font-medium">Tanpa biaya admin</p>}
                      </div>
                      <div className={cn('w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                        selectedMethod === m.code ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-gray-300')}>
                        {selectedMethod === m.code && <Check size={12} className="text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedMethod && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 text-sm space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Paket</span><span className="font-bold">Umrava Premium</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Harga</span><span>{formatRp(AMOUNT)}</span></div>
            {fee > 0 && <div className="flex justify-between"><span className="text-gray-500">Biaya admin</span><span className="text-orange-500 font-semibold">{formatRp(fee)}</span></div>}
            <div className="border-t border-gray-50 pt-2 flex justify-between font-black"><span>Total</span><span className="text-[#0D4A28] text-lg">{formatRp(total)}</span></div>
          </div>
        )}
        <button onClick={handleCreateTransaction} disabled={!selectedMethod || creating}
          className="w-full py-4 bg-[#1B6B3A] hover:bg-[#0D4A28] disabled:opacity-50 text-white rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2">
          {creating ? <><Loader2 size={16} className="animate-spin" /> Membuat tagihan...</> : 'Aktifkan Premium Sekarang →'}
        </button>
        <p className="text-xs text-center text-gray-400 mt-3">🔒 Pembayaran aman via Duitku</p>
      </div>
    </div>
  )

  // ── INSTRUCTIONS ─────────────────────────────────────────────────────────────
  if (step === 'instructions' && transaction) return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-start justify-center px-5 py-12">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-xl font-black text-[#0D4A28]">Instruksi Pembayaran</h1>
          <p className="text-gray-500 text-sm">Selesaikan pembayaran untuk mengaktifkan akses Premium</p>
        </div>
        <div className="bg-[#F5E6C8] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock size={18} className="text-[#8B6914]" />
            <div>
              <p className="text-xs text-[#8B6914] font-semibold">Batas Waktu</p>
              <p className="font-black text-[#8B6914] text-xl">{countdown}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#8B6914]/70">Total</p>
            <p className="font-black text-[#8B6914] text-lg">{formatRp(transaction.total_amount)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[rgba(201,168,76,0.2)] p-5 space-y-4">
          {(isVA || transaction.pay_code) && transaction.pay_code && (
            <div className="bg-[#FBF7F0] rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Nomor Virtual Account / Kode Pembayaran</p>
              <div className="flex items-center justify-between gap-3">
                <p className="text-2xl font-black text-[#0D4A28] tracking-widest">{transaction.pay_code}</p>
                <CopyBtn text={transaction.pay_code} />
              </div>
            </div>
          )}
          {isQRIS && transaction.qr_url && (
            <div className="flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={transaction.qr_url} alt="QR" className="w-48 h-48 rounded-xl border border-gray-100" />
              <p className="text-xs text-gray-500 text-center">Scan dengan GoPay, OVO, DANA, ShopeePay, atau QRIS lainnya</p>
            </div>
          )}
          {transaction.checkout_url && (
            <a href={transaction.checkout_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100">
              <ExternalLink size={15} /> Buka Halaman Pembayaran
            </a>
          )}
          {transaction.instructions?.length > 0 && (
            <div className="space-y-3">
              {transaction.instructions.map((inst, i) => (
                <div key={i}>
                  <p className="text-xs font-bold text-gray-700 mb-1.5">{inst.title}</p>
                  <ol className="space-y-1">
                    {inst.steps.map((s, j) => (
                      <li key={j} className="flex gap-2 text-xs text-gray-600">
                        <span className="font-bold text-[#C9A84C] flex-shrink-0">{j + 1}.</span>
                        <span dangerouslySetInnerHTML={{ __html: s }} />
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Nomor Referensi</p>
            <p className="text-xs font-mono text-gray-600">{transaction.reference}</p>
          </div>
          <CopyBtn text={transaction.reference} />
        </div>
        <button onClick={checkStatus} disabled={checking}
          className="w-full py-4 bg-[#1B6B3A] hover:bg-[#0D4A28] disabled:opacity-70 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
          {checking ? <><Loader2 size={16} className="animate-spin" /> Mengecek...</> : <><RefreshCw size={16} /> Saya Sudah Bayar — Cek Status</>}
        </button>
        <p className="text-xs text-center text-gray-400">Status diperbarui otomatis setiap 30 detik</p>
        <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600 text-center">
          📧 Instruksi pembayaran juga dikirim ke email Anda. Cek folder <strong>Spam/Promosi</strong> jika tidak ada di inbox.
        </div>
        <button onClick={() => router.push('/dashboard')}
          className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Bayar Nanti — Masuk ke Dashboard
        </button>
      </div>
    </div>
  )

  // ── SUCCESS ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center px-5">
      <div className="max-w-sm w-full text-center">
        <div className="w-24 h-24 rounded-full bg-[#E8F5ED] flex items-center justify-center mx-auto mb-5">
          <div className="text-5xl">🕋</div>
        </div>
        <h1 className="text-2xl font-black text-[#0D4A28] mb-2">Alhamdulillah! 🎉</h1>
        <p className="text-gray-600 mb-1">Pembayaran berhasil dikonfirmasi.</p>
        <p className="text-[#1B6B3A] font-bold text-lg mb-6">Akun Premium Anda telah aktif!</p>
        <div className="bg-[#E8F5ED] rounded-2xl p-4 mb-5 text-left space-y-2">
          {PREMIUM_FEATURES.slice(0, 6).map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-[#1B6B3A]">
              <CheckCircle2 size={14} /> <span>{f}</span>
            </div>
          ))}
        </div>
        <div className="bg-[#F5E6C8] rounded-2xl p-4 mb-6 text-[#8B6914] text-sm">
          🤲 Semoga Allah memudahkan perjalanan umroh Anda. Barakallah fiik.
        </div>
        <button onClick={() => router.push('/dashboard')}
          className="w-full py-4 bg-[#1B6B3A] hover:bg-[#0D4A28] text-white rounded-2xl font-black text-base transition-colors">
          Mulai Eksplorasi Dashboard →
        </button>
      </div>
    </div>
  )
}
