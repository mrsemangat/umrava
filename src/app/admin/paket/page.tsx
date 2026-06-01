'use client'
import { useState, useEffect, useCallback } from 'react'
import { Crown, Users, CheckCircle2, Lock, RefreshCw } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const FREE_FEATURES = [
  { label: 'Panduan ibadah 6 tahap lengkap', included: true },
  { label: 'Counter tawaf & sa\'i', included: true },
  { label: 'Bank doa 20+ dengan audio', included: true },
  { label: 'Panduan praktis Tanah Suci', included: true },
  { label: '5 spot foto pilihan', included: true },
  { label: 'Checklist dokumen dasar', included: true },
  { label: 'Kalkulator estimasi biaya', included: false },
  { label: 'Itinerary builder + export PDF', included: false },
  { label: 'Semua 15+ spot foto + tips detail', included: false },
  { label: 'Tracker persiapan lengkap', included: false },
  { label: 'Mode offline penuh', included: false },
  { label: 'Update konten seumur hidup', included: false },
]

interface PendingUser {
  id: string
  full_name: string | null
  email: string | null
  plan: string
  city: string | null
  created_at: string
}

export default function AdminPaketPage() {
  const [freeUsers, setFreeUsers] = useState<PendingUser[]>([])
  const [premiumUsers, setPremiumUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [price, setPrice] = useState(49000)
  const [editingPrice, setEditingPrice] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const [freeRes, premRes] = await Promise.all([
      fetch('/api/admin/users?plan=free&limit=50'),
      fetch('/api/admin/users?plan=premium&limit=50'),
    ])
    const freeData = await freeRes.json()
    const premData = await premRes.json()
    setFreeUsers(freeData.users ?? [])
    setPremiumUsers(premData.users ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const upgradeUser = async (userId: string, userName: string) => {
    setUpgrading(userId)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan: 'premium' }),
    })
    const data = await res.json()
    if (data.error) {
      toast.error(data.error)
    } else {
      toast.success(`${userName} berhasil diupgrade ke Premium ✨`)
      fetchUsers()
    }
    setUpgrading(null)
  }

  const downgradeUser = async (userId: string, userName: string) => {
    if (!confirm(`Downgrade ${userName} ke Free?`)) return
    setUpgrading(userId)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan: 'free' }),
    })
    const data = await res.json()
    if (data.error) {
      toast.error(data.error)
    } else {
      toast.success(`${userName} di-downgrade ke Free`)
      fetchUsers()
    }
    setUpgrading(null)
  }

  const revenue = premiumUsers.length * price

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Manajemen Paket</h1>
        <p className="text-gray-500 text-sm">Atur paket Free & Premium, upgrade/downgrade user</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="text-3xl font-black text-gray-600">{freeUsers.length}</div>
          <div className="text-sm font-semibold text-gray-500 mt-1">User Free</div>
          <div className="text-xs text-gray-400">Belum upgrade</div>
        </div>
        <div className="bg-[#F5E6C8] rounded-2xl border border-[rgba(201,168,76,0.3)] shadow-sm p-5">
          <div className="text-3xl font-black text-[#C9A84C]">{premiumUsers.length}</div>
          <div className="text-sm font-semibold text-[#8B6914] mt-1">User Premium</div>
          <div className="text-xs text-[#C9A84C]">Sudah upgrade</div>
        </div>
        <div className="bg-[#E8F5ED] rounded-2xl border border-green-100 shadow-sm p-5">
          <div className="text-3xl font-black text-[#1B6B3A]">{formatRupiah(revenue)}</div>
          <div className="text-sm font-semibold text-[#1B6B3A] mt-1">Total Revenue</div>
          <div className="text-xs text-green-600">{premiumUsers.length} × {formatRupiah(price)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="text-3xl font-black text-purple-600">
            {freeUsers.length + premiumUsers.length > 0
              ? Math.round((premiumUsers.length / (freeUsers.length + premiumUsers.length)) * 100)
              : 0}%
          </div>
          <div className="text-sm font-semibold text-gray-500 mt-1">Konversi</div>
          <div className="text-xs text-gray-400">Free → Premium</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Paket Free */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <div className="font-bold text-gray-900 flex items-center gap-2">
                <Users size={16} className="text-gray-500" /> Paket Free
              </div>
              <div className="text-xl font-black text-gray-700 mt-0.5">Rp 0</div>
            </div>
            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full font-bold">
              {freeUsers.length} user aktif
            </span>
          </div>
          <div className="p-5">
            <div className="space-y-2 mb-5">
              {FREE_FEATURES.map((f, i) => (
                <div key={i} className={cn('flex items-center gap-2 text-sm', f.included ? 'text-gray-700' : 'text-gray-400')}>
                  {f.included
                    ? <CheckCircle2 size={15} className="text-[#1B6B3A] flex-shrink-0" />
                    : <Lock size={15} className="text-gray-300 flex-shrink-0" />}
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Paket Premium */}
        <div className="bg-[#0D4A28] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <Crown size={16} className="text-[#C9A84C]" /> Paket Premium
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {editingPrice ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      className="w-28 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm font-bold outline-none"
                    />
                    <button onClick={() => { setEditingPrice(false); toast.success('Harga diperbarui') }}
                      className="text-xs bg-[#C9A84C] text-white px-2 py-1 rounded-lg font-bold">
                      Simpan
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingPrice(true)} className="flex items-center gap-1 group">
                    <span className="text-xl font-black text-[#C9A84C]">{formatRupiah(price)}</span>
                    <span className="text-xs text-white/40 group-hover:text-white/70 transition-colors">✏️ edit</span>
                  </button>
                )}
              </div>
            </div>
            <span className="text-xs bg-[#C9A84C]/20 text-[#C9A84C] px-3 py-1.5 rounded-full font-bold">
              {premiumUsers.length} user aktif
            </span>
          </div>
          <div className="p-5">
            <div className="space-y-2">
              {FREE_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[rgba(251,247,240,0.85)]">
                  <CheckCircle2 size={15} className="text-[#C9A84C] flex-shrink-0" />
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Lists Side by Side */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Free Users — bisa diupgrade */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">User Free ({freeUsers.length})</h2>
            <button onClick={fetchUsers} className="text-gray-400 hover:text-gray-600">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-400 text-sm">Memuat...</div>
          ) : freeUsers.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              🎉 Semua user sudah premium!
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {freeUsers.map(user => (
                <div key={user.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
                    {((user.full_name ?? user.email) || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {user.full_name ?? <span className="italic text-gray-400">Tanpa nama</span>}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={() => upgradeUser(user.id, user.full_name ?? user.email ?? 'User')}
                    disabled={upgrading === user.id}
                    className="flex items-center gap-1.5 bg-[#C9A84C] hover:bg-[#b8963d] disabled:bg-gray-200 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-colors flex-shrink-0"
                  >
                    {upgrading === user.id ? '...' : <><Crown size={11} /> Upgrade</>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Premium Users — bisa di-downgrade */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">User Premium ({premiumUsers.length})</h2>
            <span className="text-xs text-[#1B6B3A] font-semibold">{formatRupiah(revenue)} revenue</span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-400 text-sm">Memuat...</div>
          ) : premiumUsers.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">Belum ada user premium</div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {premiumUsers.map(user => (
                <div key={user.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5E6C8] flex items-center justify-center text-[#C9A84C] font-bold text-sm flex-shrink-0">
                    {((user.full_name ?? user.email) || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1.5">
                      {user.full_name ?? <span className="italic text-gray-400">Tanpa nama</span>}
                      <Crown size={11} className="text-[#C9A84C]" />
                    </div>
                    <div className="text-xs text-gray-400 truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={() => downgradeUser(user.id, user.full_name ?? user.email ?? 'User')}
                    disabled={upgrading === user.id}
                    className="text-xs text-gray-400 hover:text-red-400 disabled:text-gray-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors font-medium flex-shrink-0"
                  >
                    {upgrading === user.id ? '...' : 'Downgrade'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
