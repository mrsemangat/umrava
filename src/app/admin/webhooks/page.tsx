'use client'
import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface WebhookLog {
  id: string
  source: string
  event: string
  order_id: string | null
  buyer_email: string | null
  buyer_name: string | null
  amount: number | null
  status: string | null
  user_upgraded: boolean
  error: string | null
  payload: Record<string, unknown>
  created_at: string
}

const STATUS_BADGE: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  success: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  signature_invalid: 'bg-red-100 text-red-700',
}

export default function AdminWebhooksPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({ total: 0, upgraded: 0, errors: 0, revenue: 0 })

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhook/scalev`
    : 'https://baitgo.vercel.app/api/webhook/scalev'

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (data) {
      setLogs(data)
      setStats({
        total: data.length,
        upgraded: data.filter(l => l.user_upgraded).length,
        errors: data.filter(l => l.error && !l.user_upgraded).length,
        revenue: data.filter(l => l.user_upgraded).reduce((s, l) => s + (l.amount ?? 0), 0),
      })
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Webhook ScaleV</h1>
          <p className="text-gray-500 text-sm">Log otomatis upgrade user dari ScaleV</p>
        </div>
        <button onClick={fetchLogs}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Webhook URL Card */}
      <div className="bg-[#0D4A28] rounded-2xl p-5 mb-6 text-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base">🔗 URL Webhook</h2>
          <span className="text-xs bg-green-400/20 text-green-300 px-2.5 py-1 rounded-full font-semibold">
            ● Live
          </span>
        </div>
        <div className="flex items-center gap-3 bg-black/20 rounded-xl px-4 py-3">
          <code className="flex-1 text-sm text-[#C9A84C] font-mono break-all">{webhookUrl}</code>
          <button onClick={copyUrl}
            className="flex-shrink-0 flex items-center gap-1.5 bg-[#C9A84C] hover:bg-[#b8963d] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
            {copied ? <><Check size={12} /> Disalin</> : <><Copy size={12} /> Salin</>}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
          {[
            { label: 'Method', val: 'POST' },
            { label: 'Content-Type', val: 'application/json' },
            { label: 'Auth', val: 'x-scalev-signature (HMAC SHA256)' },
          ].map((item, i) => (
            <div key={i} className="bg-black/20 rounded-lg px-3 py-2">
              <div className="text-white/50 mb-0.5">{item.label}</div>
              <div className="text-white font-mono font-semibold">{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Guide */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">📋 Cara Setup di ScaleV</h2>
        <ol className="space-y-3">
          {[
            { step: '1', text: 'Login ke ScaleV → buka produk BaitGo Premium' },
            { step: '2', text: 'Masuk ke Settings → Webhook / Integrasi' },
            { step: '3', text: 'Tempel URL webhook di atas ke kolom "Webhook URL"' },
            { step: '4', text: 'Salin "Webhook Secret" dari ScaleV → tambahkan ke Vercel env vars sebagai SCALEV_WEBHOOK_SECRET' },
            { step: '5', text: 'Pilih event: order.paid / payment.success / status berhasil' },
            { step: '6', text: 'Simpan dan klik "Test Webhook" — cek log di bawah' },
          ].map(item => (
            <li key={item.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1B6B3A] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.step}
              </div>
              <span className="text-sm text-gray-700">{item.text}</span>
            </li>
          ))}
        </ol>

        {/* Env var reminder */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
          <strong>⚠️ Penting:</strong> tambahkan <code className="bg-yellow-100 px-1 rounded">SCALEV_WEBHOOK_SECRET</code> dan{' '}
          <code className="bg-yellow-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> ke Vercel Environment Variables
          sebelum live. Tanpanya, webhook tetap berjalan tapi tanpa verifikasi signature.
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Webhook', val: stats.total, color: 'text-gray-900' },
          { label: 'User Diupgrade', val: stats.upgraded, color: 'text-green-600' },
          { label: 'Error / Gagal', val: stats.errors, color: 'text-red-500' },
          { label: 'Revenue via ScaleV', val: stats.revenue > 0 ? formatRupiah(stats.revenue) : 'Rp 0', color: 'text-[#C9A84C]' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-900">Log Webhook Masuk</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
            Memuat log...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500 font-semibold">Belum ada webhook masuk</p>
            <p className="text-gray-400 text-sm mt-1">Setup ScaleV webhook dulu, lalu test dengan order percobaan</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map(log => (
              <div key={log.id}>
                <div
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {log.user_upgraded ? (
                      <CheckCircle2 size={18} className="text-green-500" />
                    ) : log.error ? (
                      <XCircle size={18} className="text-red-400" />
                    ) : (
                      <Clock size={18} className="text-yellow-400" />
                    )}
                  </div>

                  {/* Email + name */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {log.buyer_email ?? '(no email)'}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {log.buyer_name ?? ''} {log.order_id ? `· Order: ${log.order_id}` : ''}
                    </div>
                  </div>

                  {/* Amount */}
                  {log.amount ? (
                    <div className="text-sm font-bold text-[#1B6B3A] flex-shrink-0">
                      {formatRupiah(log.amount)}
                    </div>
                  ) : null}

                  {/* Status badge */}
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_BADGE[log.status?.toLowerCase() ?? ''] ?? 'bg-gray-100 text-gray-500'}`}>
                    {log.status ?? 'unknown'}
                  </span>

                  {/* Upgraded badge */}
                  {log.user_upgraded && (
                    <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold flex-shrink-0">
                      ✅ Upgraded
                    </span>
                  )}

                  {/* Time */}
                  <div className="text-xs text-gray-400 flex-shrink-0 hidden md:block">
                    {new Date(log.created_at).toLocaleString('id-ID', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>

                  {expandedId === log.id
                    ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0" />
                    : <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />}
                </div>

                {/* Expanded payload */}
                {expandedId === log.id && (
                  <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                    {log.error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 text-xs text-red-600 mt-3">
                        ⚠️ Error: {log.error}
                      </div>
                    )}
                    <div className="mt-3">
                      <div className="text-xs font-bold text-gray-500 mb-1.5">Raw Payload:</div>
                      <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto max-h-60 font-mono">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
