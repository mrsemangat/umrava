'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw, CheckCircle2, Clock, XCircle, Crown,
  Search, AlertCircle, Zap, ChevronDown, ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'

interface Transaction {
  orderId: string
  userEmail: string | null
  userFullName: string | null
  userId: string | null
  amount: number | null
  status: string
  userUpgraded: boolean
  userPlan: string | null
  createdAt: string | null
  updatedAt: string | null
  events: string[]
}

function StatusBadge({ tx }: { tx: Transaction }) {
  if (tx.userUpgraded || tx.userPlan === 'premium') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
        <CheckCircle2 size={11} /> LUNAS
      </span>
    )
  }
  if (tx.status === 'UNPAID' || tx.status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
        <Clock size={11} /> PENDING
      </span>
    )
  }
  if (tx.status === 'PAID') {
    // Paid di Duitku tapi belum diupgrade — anomali
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
        <AlertCircle size={11} /> PAID-BELUM UPGRADE
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
      <XCircle size={11} /> {tx.status}
    </span>
  )
}

function formatRp(n: number | null) {
  if (!n) return 'Rp—'
  return `Rp${n.toLocaleString('id-ID')}`
}

function formatDate(s: string | null) {
  if (!s) return '—'
  return new Date(s).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function TransactionsPage() {
  const [all, setAll] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'upgraded'>('all')
  const [search, setSearch] = useState('')
  const [checking, setChecking] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/transactions')
      const data = await res.json()
      setAll(data.transactions ?? [])
    } catch {
      toast.error('Gagal memuat data transaksi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const checkAndUpgrade = async (tx: Transaction) => {
    if (checking) return
    setChecking(tx.orderId)
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: tx.orderId }),
      })
      const data = await res.json()
      if (data.action === 'upgraded') {
        toast.success(data.message)
        load()
      } else if (data.ok) {
        toast.info(data.message)
      } else {
        toast.error(data.message || 'Transaksi belum lunas')
      }
    } catch {
      toast.error('Gagal mengecek transaksi')
    } finally {
      setChecking(null)
    }
  }

  const filtered = all.filter(tx => {
    const matchFilter =
      filter === 'all' ||
      (filter === 'pending' && !tx.userUpgraded && tx.userPlan !== 'premium') ||
      (filter === 'paid' && (tx.userUpgraded || tx.userPlan === 'premium')) ||
      (filter === 'upgraded' && (tx.userUpgraded || tx.userPlan === 'premium'))
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (tx.userEmail ?? '').toLowerCase().includes(q) ||
      (tx.userFullName ?? '').toLowerCase().includes(q) ||
      tx.orderId.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const stats = {
    total: all.length,
    upgraded: all.filter(t => t.userUpgraded || t.userPlan === 'premium').length,
    pending: all.filter(t => !t.userUpgraded && t.userPlan !== 'premium').length,
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Histori Transaksi</h1>
          <p className="text-gray-500 text-sm mt-0.5">Semua transaksi Duitku — pantau & follow up pending</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Transaksi', val: stats.total, icon: '💳', color: 'text-gray-900' },
          { label: 'Sudah Lunas', val: stats.upgraded, icon: '✅', color: 'text-green-600' },
          { label: 'Masih Pending', val: stats.pending, icon: '⏳', color: 'text-yellow-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-xl mb-0.5">{s.icon}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari email, nama, atau Order ID..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#C9A84C]"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'paid'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                filter === f
                  ? 'bg-[#1B6B3A] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'pending' ? 'Pending' : 'Lunas'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw size={24} className="animate-spin mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">Memuat transaksi...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500 font-semibold">Tidak ada transaksi</p>
            <p className="text-gray-400 text-sm mt-1">
              {search ? 'Coba ubah kata kunci pencarian' : 'Belum ada transaksi yang masuk'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(tx => {
              const isPending = !tx.userUpgraded && tx.userPlan !== 'premium'
              const isExpanded = expanded === tx.orderId
              return (
                <div key={tx.orderId}>
                  <div
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : tx.orderId)}
                  >
                    {/* Status icon */}
                    <div className="flex-shrink-0">
                      {tx.userUpgraded || tx.userPlan === 'premium'
                        ? <CheckCircle2 size={18} className="text-green-500" />
                        : <Clock size={18} className="text-yellow-400" />
                      }
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {tx.userFullName || tx.userEmail || '(tanpa nama)'}
                        </p>
                        {tx.userPlan === 'premium' && (
                          <Crown size={12} className="text-[#C9A84C] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{tx.userEmail}</p>
                      <p className="text-xs font-mono text-gray-300 truncate hidden sm:block">{tx.orderId}</p>
                    </div>

                    {/* Amount */}
                    <div className="text-sm font-bold text-[#1B6B3A] flex-shrink-0 hidden sm:block">
                      {formatRp(tx.amount)}
                    </div>

                    {/* Status badge */}
                    <div className="flex-shrink-0">
                      <StatusBadge tx={tx} />
                    </div>

                    {/* Date */}
                    <div className="text-xs text-gray-400 flex-shrink-0 hidden md:block text-right">
                      {formatDate(tx.updatedAt)}
                    </div>

                    {/* Action: Cek & Upgrade */}
                    {isPending && (
                      <button
                        onClick={e => { e.stopPropagation(); checkAndUpgrade(tx) }}
                        disabled={checking === tx.orderId}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#C9A84C] hover:bg-[#b8963d] disabled:opacity-60 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        {checking === tx.orderId
                          ? <RefreshCw size={11} className="animate-spin" />
                          : <Zap size={11} />
                        }
                        {checking === tx.orderId ? 'Mengecek...' : 'Cek & Upgrade'}
                      </button>
                    )}

                    <div className="flex-shrink-0 text-gray-400">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-4 pt-2 bg-gray-50 border-t border-gray-100 space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        {[
                          { label: 'Order ID', val: tx.orderId },
                          { label: 'Jumlah', val: formatRp(tx.amount) },
                          { label: 'Tanggal Buat', val: formatDate(tx.createdAt) },
                          { label: 'Plan User', val: tx.userPlan ?? 'free' },
                        ].map((item, i) => (
                          <div key={i} className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-gray-400 mb-0.5">{item.label}</p>
                            <p className="font-semibold text-gray-800 break-all">{item.val}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-gray-100 text-xs">
                        <p className="text-gray-400 mb-1">Events tercatat:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {tx.events.map((ev, i) => (
                            <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{ev}</span>
                          ))}
                        </div>
                      </div>
                      {isPending && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
                          ⏳ <strong>Follow up:</strong> Tanyakan ke user apakah sudah melakukan pembayaran. Jika iya, klik <strong>"Cek &amp; Upgrade"</strong> untuk verifikasi ke Duitku dan upgrade otomatis.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
            Menampilkan {filtered.length} dari {all.length} transaksi
          </div>
        )}
      </div>
    </div>
  )
}
