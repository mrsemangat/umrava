'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Crown, ChevronLeft, Loader2, CheckCircle2, Copy, Check,
  Clock, AlertCircle, RefreshCw, ExternalLink, Banknote, MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { PaymentChannel, PaymentTransaction } from '@/lib/duitku'
import type { BankAccount } from '@/lib/paymentSettings'

// ── Constants ──────────────────────────────────────────────────────────────────

const AMOUNT = 49000
const TX_KEY = 'umrava_pending_tx'
const ADMIN_WA = '6281313585848'

const PREMIUM_FEATURES = [
  { icon: '☀️', label: 'Zikir Pagi & Petang Al-Banna (15 zikir + counter)' },
  { icon: '📖', label: 'Al-Quran lengkap 114 surah + Mishary audio' },
  { icon: '🤲', label: 'Bank doa lengkap dengan audio Arab' },
  { icon: '🧭', label: 'Kompas kiblat real-time + penanggalan Hijriah' },
  { icon: '📋', label: 'Tracker persiapan + perencanaan biaya detail' },
  { icon: '♾️', label: 'Semua update fitur tanpa biaya tambahan' },
]

const BANK_CONFIG: Record<string, { bg: string; text: string; abbr: string }> = {
  BRIVA:     { bg: '#015198', text: '#fff',    abbr: 'BRI' },
  BNIVA:     { bg: '#F26522', text: '#fff',    abbr: 'BNI' },
  BSIVA:     { bg: '#2E7D32', text: '#fff',    abbr: 'BSI' },
  MANDIRIVA: { bg: '#003087', text: '#FFD100', abbr: 'MANDIRI' },
  PERMATAVA: { bg: '#7B2C8B', text: '#fff',    abbr: 'PERMATA' },
  CIMBVA:    { bg: '#BB0000', text: '#fff',    abbr: 'CIMB' },
  BNCVA:     { bg: '#0070CC', text: '#fff',    abbr: 'NEO' },
  BCAVA:     { bg: '#005BAA', text: '#fff',    abbr: 'BCA' },
  QRIS:      { bg: '#E30613', text: '#fff',    abbr: 'QRIS' },
  QRISC:     { bg: '#E30613', text: '#fff',    abbr: 'QRIS' },
  ALFAMART:  { bg: '#E31837', text: '#fff',    abbr: 'ALFA' },
  INDOMARET: { bg: '#E31837', text: '#FFD700', abbr: 'INDO' },
  DANA:      { bg: '#118EEA', text: '#fff',    abbr: 'DANA' },
  OVO:       { bg: '#4C3494', text: '#fff',    abbr: 'OVO' },
  GOPAY:     { bg: '#00AED6', text: '#fff',    abbr: 'GoPay' },
  SHOPEEPAY: { bg: '#EE4D2D', text: '#fff',    abbr: 'SPay' },
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatRp(n: number) {
  return `Rp${n.toLocaleString('id-ID')}`
}

function formatCountdown(expiredUnix: number) {
  const diff = expiredUnix * 1000 - Date.now()
  if (diff <= 0) return '00:00:00'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ── Components ─────────────────────────────────────────────────────────────────

function BankLogo({ code, iconUrl }: { code: string; iconUrl?: string }) {
  if (iconUrl) {
    return (
      <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden p-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconUrl} alt={code} className="w-full h-full object-contain"
          onError={e => { (e.currentTarget.parentElement!).innerHTML = `<span style="font-size:9px;font-weight:900;color:#6b7280">${code}</span>` }}
        />
      </div>
    )
  }
  const cfg = BANK_CONFIG[code]
  if (!cfg) return <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">💳</div>
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs leading-tight text-center flex-shrink-0 shadow-sm"
      style={{ background: cfg.bg, color: cfg.text, fontSize: cfg.abbr.length > 4 ? '9px' : '11px' }}
    >
      {cfg.abbr}
    </div>
  )
}

function CopyButton({ text, label = 'Salin' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
        copied ? 'bg-green-100 text-green-700' : 'bg-[#E8F5ED] text-[#1B6B3A] hover:bg-[#1B6B3A] hover:text-white'
      )}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Tersalin!' : label}
    </button>
  )
}

function MethodCard({
  code, name, fee, iconUrl, selected, onSelect,
}: {
  code: string; name: string; fee?: number; iconUrl?: string; selected: boolean; onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left',
        selected
          ? 'border-[#C9A84C] bg-[#FFFBF0] shadow-md ring-2 ring-[#C9A84C]/20'
          : 'border-gray-100 bg-white hover:border-[#C9A84C]/50 hover:shadow-sm'
      )}
    >
      <BankLogo code={code} iconUrl={iconUrl} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
        {fee !== undefined && fee > 0
          ? <p className="text-xs text-gray-400">+ biaya admin {formatRp(fee)}</p>
          : <p className="text-xs text-green-600 font-medium">Tanpa biaya admin</p>
        }
      </div>
      <div className={cn(
        'w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all flex items-center justify-center',
        selected ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-gray-300'
      )}>
        {selected && <Check size={12} className="text-white" />}
      </div>
    </button>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────────

type Step = 'method' | 'confirm' | 'instructions' | 'success' | 'transfer-instructions'
type MethodType = 'gateway' | 'bank_transfer'

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function UpgradePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('method')
  const [methodType, setMethodType] = useState<MethodType>('gateway')

  // Payment method settings
  const [gatewayEnabled, setGatewayEnabled] = useState(true)
  const [bankTransferEnabled, setBankTransferEnabled] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null)

  // Gateway (Duitku)
  const [channels, setChannels] = useState<PaymentChannel[]>([])
  const [channelsLoading, setChannelsLoading] = useState(true)
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [phone, setPhone] = useState('')
  const [creating, setCreating] = useState(false)
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null)
  const [countdown, setCountdown] = useState('')
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [autoCheck, setAutoCheck] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Bank transfer
  const [transferOrderId, setTransferOrderId] = useState('')
  const [transferSubmitting, setTransferSubmitting] = useState(false)

  // Restore pending transaction from sessionStorage (handles page refresh / Duitku returnUrl)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = sessionStorage.getItem(TX_KEY)
    if (!raw) return
    try {
      const { transaction: tx } = JSON.parse(raw) as { transaction: PaymentTransaction }
      if (tx?.expired_time * 1000 > Date.now()) {
        setTransaction(tx)
        setStep('instructions')
        setAutoCheck(true)
      } else {
        sessionStorage.removeItem(TX_KEY)
      }
    } catch {
      sessionStorage.removeItem(TX_KEY)
    }
  }, [])

  // InitiateCheckout pixel — user membuka halaman upgrade (belum ada pending tx)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq && !sessionStorage.getItem(TX_KEY)) {
      window.fbq('track', 'InitiateCheckout', { value: AMOUNT, currency: 'IDR', content_name: 'Umrava Premium' })
    }
  }, [])

  // Load payment method settings first, then conditionally load channels
  useEffect(() => {
    fetch('/api/payment/methods')
      .then(r => r.json())
      .then(d => {
        const gw = d.gatewayEnabled ?? true
        const bt = d.bankTransferEnabled ?? false
        setGatewayEnabled(gw)
        setBankTransferEnabled(bt)
        setBankAccounts(d.bankAccounts ?? [])

        if (!gw) {
          // Gateway disabled — no need to fetch channels
          setChannelsLoading(false)
          return
        }
        // Fetch channels only after we know gateway is enabled
        fetch('/api/payment/channels')
          .then(r => r.json())
          .then(data => {
            if (data.channels?.length > 0) setChannels(data.channels)
          })
          .catch(() => {})
          .finally(() => setChannelsLoading(false))
      })
      .catch(() => setChannelsLoading(false))
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!transaction?.expired_time) return
    const id = setInterval(() => setCountdown(formatCountdown(transaction.expired_time)), 1000)
    setCountdown(formatCountdown(transaction.expired_time))
    return () => clearInterval(id)
  }, [transaction?.expired_time])

  // Auto polling payment status (Duitku)
  const checkStatus = useCallback(async () => {
    if (!transaction?.reference) return
    setCheckingStatus(true)
    try {
      const res = await fetch(`/api/payment/status?orderId=${transaction.merchantOrderId}`)
      const data = await res.json()
      if (data.statusCode === '00') {
        sessionStorage.removeItem(TX_KEY)
        setStep('success')
        setAutoCheck(false)
        toast.success('Pembayaran berhasil! Akun Premium Anda telah aktif 🎉')
        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'Purchase', { value: AMOUNT, currency: 'IDR', content_name: 'Umrava Premium' })
        }
      } else if (data.statusCode === '02') {
        sessionStorage.removeItem(TX_KEY)
        toast.error('Transaksi kadaluarsa atau gagal. Silakan buat transaksi baru.')
        setAutoCheck(false)
      }
    } catch {}
    finally { setCheckingStatus(false) }
  }, [transaction?.reference])

  useEffect(() => {
    if (!autoCheck) { if (intervalRef.current) clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(checkStatus, 30000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [autoCheck, checkStatus])

  const groupedChannels = (() => {
    if (channels.length === 0) return []
    const groups: Record<string, { code: string; name: string; fee: number; iconUrl?: string }[]> = {}
    channels.forEach(ch => {
      if (!groups[ch.group]) groups[ch.group] = []
      groups[ch.group].push({ code: ch.code, name: ch.name, fee: ch.totalFee, iconUrl: ch.icon_url })
    })
    return Object.entries(groups).map(([name, methods]) => ({ name, methods }))
  })()

  const selectedChannel = channels.find(c => c.code === selectedMethod)
  const fee = selectedChannel?.totalFee ?? 0
  const totalAmount = AMOUNT + fee

  const handleCreateGatewayTransaction = async () => {
    if (!selectedMethod) { toast.error('Pilih metode pembayaran'); return }
    setCreating(true)
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddPaymentInfo', { value: AMOUNT, currency: 'IDR', content_name: 'Umrava Premium', payment_type: selectedMethod })
    }
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: selectedMethod, phone }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Gagal membuat transaksi')
      setTransaction(data.transaction)
      setStep('instructions')
      setAutoCheck(true)
      sessionStorage.setItem(TX_KEY, JSON.stringify({ transaction: data.transaction }))
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const handleSubmitBankTransfer = async () => {
    if (!selectedBankAccount) { toast.error('Pilih rekening tujuan transfer'); return }
    setTransferSubmitting(true)
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddPaymentInfo', { value: AMOUNT, currency: 'IDR', content_name: 'Umrava Premium', payment_type: 'bank_transfer' })
    }
    try {
      const res = await fetch('/api/payment/bank-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankName: selectedBankAccount.bankName }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Gagal membuat order transfer')
      setTransferOrderId(data.merchantOrderId)
      setStep('transfer-instructions')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setTransferSubmitting(false)
    }
  }

  const goBack = () => {
    if (step === 'instructions') {
      // Terkunci — sudah ada VA aktif, jangan buat transaksi baru
      toast.info('Selesaikan pembayaran terlebih dahulu, atau tunggu VA kadaluarsa.')
      return
    }
    if (step === 'method') { router.back(); return }
    if (step === 'confirm' || step === 'transfer-instructions') setStep('method')
    else setStep('method')
  }

  const isQRIS = transaction?.payment_method_code?.toUpperCase() === 'QR'
  const isStore = ['A1', 'I1', 'FT'].includes(transaction?.payment_method_code?.toUpperCase() ?? '')
  const isVA = !!transaction?.pay_code && !isQRIS && !isStore

  const waMessage = encodeURIComponent(
    `Assalamu'alaikum, saya sudah transfer Rp49.000 untuk upgrade ke Umrava Premium.\n\n` +
    `Order ID: ${transferOrderId}\n` +
    `Bank: ${selectedBankAccount?.bankName ?? ''}\n\n` +
    `Mohon dikonfirmasi. Terima kasih 🙏`
  )

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {step !== 'instructions' && (
          <button
            onClick={goBack}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-xl font-black text-[#0D4A28] flex items-center gap-2">
            <Crown size={20} className="text-[#C9A84C]" /> Upgrade Premium
          </h1>
          <p className="text-xs text-gray-400">Akses seumur hidup · {formatRp(AMOUNT)}</p>
        </div>
      </div>

      {/* Progress */}
      {!['success', 'transfer-instructions'].includes(step) && (
        <div className="flex items-center gap-2 mb-6">
          {['method', 'confirm', 'instructions'].map((s, i) => {
            const steps = ['method', 'confirm', 'instructions']
            const current = steps.indexOf(step)
            return (
              <div key={s} className="flex items-center flex-1">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all',
                  i < current ? 'bg-[#1B6B3A] text-white' :
                    i === current ? 'bg-[#C9A84C] text-white' : 'bg-gray-100 text-gray-400'
                )}>
                  {i < current ? <Check size={12} /> : i + 1}
                </div>
                {i < 2 && <div className={cn('flex-1 h-0.5 mx-1', i < current ? 'bg-[#1B6B3A]' : 'bg-gray-100')} />}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Step 1: Pilih Metode ── */}
      {step === 'method' && (
        <div className="space-y-5">
          {/* Package summary */}
          <div className="bg-gradient-to-br from-[#1B6B3A] to-[#0D4A28] rounded-3xl p-5 text-white">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-wide mb-1">Paket Premium</p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-black">{formatRp(AMOUNT)}</span>
              <span className="text-white/50 text-sm">sekali bayar</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {PREMIUM_FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-white/80">
                  <span className="flex-shrink-0">{f.icon}</span>
                  <span className="leading-tight">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment gateway channels */}
          {gatewayEnabled && (
            <div>
              <p className="text-sm font-bold text-gray-700 mb-3">Bayar via Payment Gateway</p>
              {channelsLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 size={24} className="text-[#1B6B3A] animate-spin" />
                  <p className="text-xs text-gray-400">Memuat metode pembayaran...</p>
                </div>
              ) : groupedChannels.length === 0 ? (
                <div className="text-center py-6">
                  <AlertCircle size={28} className="text-orange-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Metode pembayaran gateway tidak tersedia</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedChannels.map(group => (
                    <div key={group.name}>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{group.name}</p>
                      <div className="space-y-2">
                        {group.methods.map(m => (
                          <MethodCard
                            key={m.code} code={m.code} name={m.name} fee={m.fee} iconUrl={m.iconUrl}
                            selected={methodType === 'gateway' && selectedMethod === m.code}
                            onSelect={() => { setMethodType('gateway'); setSelectedMethod(m.code); setSelectedBankAccount(null) }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bank transfer option */}
          {bankTransferEnabled && bankAccounts.length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-700 mb-3">
                {gatewayEnabled ? 'Atau Transfer Manual' : 'Pilih Rekening Tujuan Transfer'}
              </p>
              <div className="space-y-2">
                {bankAccounts.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => { setMethodType('bank_transfer'); setSelectedBankAccount(acc); setSelectedMethod('') }}
                    className={cn(
                      'w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left',
                      methodType === 'bank_transfer' && selectedBankAccount?.id === acc.id
                        ? 'border-[#C9A84C] bg-[#FFFBF0] shadow-md ring-2 ring-[#C9A84C]/20'
                        : 'border-gray-100 bg-white hover:border-[#C9A84C]/50 hover:shadow-sm'
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#1B6B3A] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                      {acc.bankName.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{acc.bankName}</p>
                      <p className="text-xs font-mono text-gray-600">{acc.accountNumber}</p>
                      <p className="text-xs text-gray-400">{acc.accountName}</p>
                      <p className="text-xs text-green-600 font-medium mt-0.5">Tanpa biaya admin</p>
                    </div>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all flex items-center justify-center',
                      methodType === 'bank_transfer' && selectedBankAccount?.id === acc.id ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-gray-300'
                    )}>
                      {methodType === 'bank_transfer' && selectedBankAccount?.id === acc.id && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                ))}
              </div>
              {bankTransferEnabled && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Transfer Manual membutuhkan konfirmasi admin (1-24 jam)
                </p>
              )}
            </div>
          )}

          {!gatewayEnabled && !bankTransferEnabled && (
            <div className="text-center py-10">
              <AlertCircle size={32} className="text-orange-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">Pembayaran sedang tidak tersedia</p>
              <p className="text-xs text-gray-400">Silakan hubungi admin untuk informasi lebih lanjut</p>
            </div>
          )}

          {(gatewayEnabled || bankTransferEnabled) && (
            <button
              onClick={() => {
                if (methodType === 'gateway' && !selectedMethod) { toast.error('Pilih metode pembayaran terlebih dahulu'); return }
                if (methodType === 'bank_transfer' && !selectedBankAccount) { toast.error('Pilih rekening tujuan transfer'); return }
                setStep('confirm')
              }}
              disabled={methodType === 'gateway' ? !selectedMethod : !selectedBankAccount}
              className="w-full py-4 bg-[#C9A84C] hover:bg-[#b8963d] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-base transition-all"
            >
              Lihat Ringkasan Pesanan →
            </button>
          )}
        </div>
      )}

      {/* ── Step 2: Konfirmasi ── */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-700 mb-4">Ringkasan Pesanan</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Paket</span>
                <span className="font-semibold text-[#0D4A28]">Umrava Premium</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Harga</span>
                <span className="font-semibold">{formatRp(AMOUNT)}</span>
              </div>
              {methodType === 'gateway' && fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Biaya admin</span>
                  <span className="font-semibold text-orange-500">{formatRp(fee)}</span>
                </div>
              )}
              <div className="border-t border-gray-50 pt-2.5 flex justify-between">
                <span className="font-bold text-gray-700">Total Bayar</span>
                <span className="font-black text-[#0D4A28] text-lg">
                  {methodType === 'gateway' ? formatRp(totalAmount) : formatRp(AMOUNT)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-700 mb-3">
              Metode: {methodType === 'bank_transfer'
                ? `Transfer ke ${selectedBankAccount?.bankName}`
                : selectedMethod
              }
            </p>
            {methodType === 'gateway' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Nomor HP (opsional, untuk konfirmasi)
                </label>
                <input
                  type="tel" value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                />
              </div>
            )}
            {methodType === 'bank_transfer' && selectedBankAccount && (
              <div className="bg-[#E8F5ED] rounded-xl p-3 text-xs text-[#1B6B3A] space-y-1">
                <p className="font-bold">Rekening Tujuan:</p>
                <p>{selectedBankAccount.bankName} — {selectedBankAccount.accountNumber}</p>
                <p>a/n {selectedBankAccount.accountName}</p>
              </div>
            )}
          </div>

          <div className={cn('rounded-xl p-3 text-xs leading-relaxed',
            methodType === 'gateway' ? 'bg-[#E8F5ED] text-[#1B6B3A]' : 'bg-yellow-50 text-yellow-700'
          )}>
            {methodType === 'gateway'
              ? '🔒 Transaksi Anda diproses aman melalui Duitku, payment gateway terpercaya Indonesia.'
              : '⏱️ Transfer Manual memerlukan konfirmasi admin (1–24 jam kerja). Anda akan menerima email setelah dikonfirmasi.'
            }
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('method')}
              className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              ← Ubah Metode
            </button>
            <button
              onClick={methodType === 'gateway' ? handleCreateGatewayTransaction : handleSubmitBankTransfer}
              disabled={creating || transferSubmitting}
              className="flex-1 py-3.5 bg-[#1B6B3A] hover:bg-[#0D4A28] disabled:opacity-70 text-white rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {(creating || transferSubmitting)
                ? <><Loader2 size={15} className="animate-spin" /> Memproses...</>
                : methodType === 'bank_transfer' ? 'Lanjut ke Instruksi Transfer →' : 'Aktifkan Premium Sekarang →'
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Step: Instruksi Transfer Manual ── */}
      {step === 'transfer-instructions' && selectedBankAccount && (
        <div className="space-y-4">
          <div className="bg-[#E8F5ED] rounded-2xl p-4 text-center">
            <Banknote size={32} className="text-[#1B6B3A] mx-auto mb-2" />
            <p className="font-bold text-[#0D4A28]">Silakan Transfer Sekarang</p>
            <p className="text-xs text-[#1B6B3A]/70 mt-1">Konfirmasi oleh admin dalam 1–24 jam kerja</p>
          </div>

          {/* Transfer detail */}
          <div className="bg-white rounded-2xl border border-[rgba(201,168,76,0.2)] p-5 space-y-4">
            <p className="font-bold text-[#0D4A28]">🏦 Detail Transfer</p>

            <div className="space-y-3">
              <div className="bg-[#FBF7F0] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Nama Bank</p>
                <p className="text-base font-black text-[#0D4A28]">{selectedBankAccount.bankName}</p>
              </div>

              <div className="bg-[#FBF7F0] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Nomor Rekening</p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-2xl font-black text-[#0D4A28] tracking-widest">
                    {selectedBankAccount.accountNumber}
                  </p>
                  <CopyButton text={selectedBankAccount.accountNumber} label="Salin" />
                </div>
              </div>

              <div className="bg-[#FBF7F0] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Nama Pemilik Rekening</p>
                <p className="text-base font-bold text-[#0D4A28]">{selectedBankAccount.accountName}</p>
              </div>

              <div className="bg-[#FBF7F0] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Jumlah Transfer</p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-2xl font-black text-[#1B6B3A]">{formatRp(AMOUNT)}</p>
                  <CopyButton text="49000" label="Salin" />
                </div>
                <p className="text-xs text-orange-600 mt-1">⚠️ Transfer tepat sejumlah di atas agar mudah diverifikasi</p>
              </div>
            </div>
          </div>

          {/* Order ID */}
          <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Order ID (sebutkan ke admin)</p>
              <p className="text-xs font-mono text-gray-600">{transferOrderId}</p>
            </div>
            <CopyButton text={transferOrderId} label="Salin" />
          </div>

          {/* WA Confirmation */}
          <a
            href={`https://wa.me/${ADMIN_WA}?text=${waMessage}`}
            target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-base transition-colors"
          >
            <MessageCircle size={18} /> Konfirmasi via WhatsApp Admin
          </a>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-600 space-y-1.5">
            <p className="font-bold">📋 Langkah Selanjutnya:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-500">
              <li>Transfer tepat {formatRp(AMOUNT)} ke rekening di atas</li>
              <li>Klik tombol WhatsApp dan kirim konfirmasi ke admin</li>
              <li>Admin akan memverifikasi dan mengaktifkan premium Anda (1–24 jam)</li>
              <li>Email konfirmasi akan dikirim setelah premium aktif</li>
            </ol>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3.5 border border-gray-200 text-gray-600 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      )}

      {/* ── Step: Instruksi Duitku ── */}
      {step === 'instructions' && transaction && (
        <div className="space-y-4">
          {/* Status + countdown */}
          <div className="bg-[#F5E6C8] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock size={18} className="text-[#8B6914]" />
              <div>
                <p className="text-xs text-[#8B6914] font-semibold">Batas Pembayaran</p>
                <p className="font-black text-[#8B6914] text-xl tracking-wider">{countdown}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#8B6914]/70">Total</p>
              <p className="font-black text-[#8B6914] text-lg">{formatRp(transaction.total_amount)}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[rgba(201,168,76,0.2)] p-5 space-y-4">
            <p className="font-bold text-[#0D4A28]">
              {isVA ? '🏦 Instruksi Transfer Virtual Account' :
                isQRIS ? '📱 Scan QR Code' :
                  isStore ? '🏪 Kode Pembayaran Minimarket' : '💳 Instruksi Pembayaran'}
            </p>

            {(isVA || transaction.pay_code) && transaction.pay_code && (
              <div className="bg-[#FBF7F0] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Nomor Virtual Account / Kode</p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-2xl font-black text-[#0D4A28] tracking-widest">{transaction.pay_code}</p>
                  <CopyButton text={transaction.pay_code} label="Salin" />
                </div>
                <p className="text-xs text-[#8B6914] mt-2">
                  {isStore ? '⚠️ Tunjukkan kode ini ke kasir Alfamart/Indomaret' :
                    '⚠️ Gunakan kode ini untuk pembayaran via mobile/internet banking'}
                </p>
              </div>
            )}

            {isQRIS && transaction.qr_url && (
              <div className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={transaction.qr_url} alt="QR Code" className="w-48 h-48 rounded-xl border border-gray-100" />
                <p className="text-xs text-gray-500 text-center">
                  Scan menggunakan GoPay, OVO, DANA, ShopeePay, atau aplikasi QRIS lainnya
                </p>
              </div>
            )}

            {transaction.checkout_url && (
              <a
                href={transaction.checkout_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
              >
                <ExternalLink size={15} /> Buka Halaman Pembayaran Duitku
              </a>
            )}

            {transaction.instructions?.length > 0 && (
              <div className="space-y-3">
                {transaction.instructions.map((inst, i) => (
                  <div key={i}>
                    <p className="text-xs font-bold text-gray-700 mb-1.5">{inst.title}</p>
                    <ol className="space-y-1">
                      {inst.steps.map((s, j) => (
                        <li key={j} className="flex gap-2 text-xs text-gray-600 leading-relaxed">
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
            <CopyButton text={transaction.reference} label="Salin" />
          </div>

          <button
            onClick={checkStatus} disabled={checkingStatus}
            className="w-full py-4 bg-[#1B6B3A] hover:bg-[#0D4A28] disabled:opacity-70 text-white rounded-2xl font-bold text-base transition-colors flex items-center justify-center gap-2"
          >
            {checkingStatus
              ? <><Loader2 size={16} className="animate-spin" /> Mengecek pembayaran...</>
              : <><RefreshCw size={16} /> Saya Sudah Bayar — Cek Status</>
            }
          </button>

          <p className="text-xs text-center text-gray-400">
            {autoCheck && '🔄 Cek otomatis setiap 30 detik · '}
            Status diperbarui otomatis setelah pembayaran masuk.
          </p>

          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600 text-center">
            📧 Instruksi juga dikirim ke email Anda. Cek <strong>Spam/Promosi</strong> jika tidak di inbox.
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 border border-gray-200 text-gray-400 rounded-2xl text-sm hover:bg-gray-50 transition-colors"
          >
            Bayar Nanti — Kembali ke Dashboard
          </button>
        </div>
      )}

      {/* ── Step: Success ── */}
      {step === 'success' && (
        <div className="text-center py-8">
          <div className="w-24 h-24 rounded-full bg-[#E8F5ED] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={48} className="text-[#1B6B3A]" />
          </div>
          <h2 className="text-2xl font-black text-[#0D4A28] mb-2">Alhamdulillah! 🎉</h2>
          <p className="text-gray-600 text-sm mb-2">Pembayaran berhasil dikonfirmasi.</p>
          <p className="text-[#1B6B3A] font-bold text-base mb-6">Akun Premium Anda telah aktif!</p>

          <div className="bg-[#E8F5ED] rounded-2xl p-5 mb-6 text-left space-y-2">
            {PREMIUM_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#1B6B3A]">
                <CheckCircle2 size={14} /><span>{f.icon} {f.label}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#F5E6C8] rounded-2xl p-4 mb-6 text-[#8B6914] text-sm">
            🤲 Semoga Allah memudahkan perjalanan umroh Anda. Barakallah fiik.
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 bg-[#1B6B3A] hover:bg-[#0D4A28] text-white rounded-2xl font-black text-base transition-colors"
          >
            Mulai Eksplorasi Premium →
          </button>
        </div>
      )}
    </div>
  )
}
