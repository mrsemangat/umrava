'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  Search, Crown, ChevronLeft, ChevronRight, RefreshCw,
  UserCog, X, MessageCircle, KeyRound, Copy, Check, ExternalLink, Trash2,
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface UserRow {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  plan: 'free' | 'premium'
  city: string | null
  departure_date: string | null
  created_at: string
  premium_activated_at: string | null
  is_admin: boolean
}

const PAGE_SIZE = 20

function buildWaMessage(user: UserRow): string {
  const nama = user.full_name?.split(' ')[0] ?? 'Sahabat'
  const kotaLine = user.city ? `\nSemoga persiapan di ${user.city} berjalan lancar. 🌙` : ''
  const departureLine = user.departure_date
    ? `\nInsya Allah keberangkatan Anda pada ${new Date(user.departure_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} semakin dekat — persiapkan diri sebaik mungkin ya.`
    : ''

  return `Assalamu'alaikum Warahmatullahi Wabarakatuh 🕋

${nama} yang dirahmati Allah,

Semoga Allah senantiasa memberikan kesehatan, kemudahan, dan keberkahan dalam setiap langkah perjalanan Anda menuju Tanah Suci. Aamiin Ya Rabb. 🤲${kotaLine}${departureLine}

Kami dari tim *Umrava* ingin menyapa dan memastikan persiapan umroh ${nama} berjalan dengan baik.

Tahukah Anda? Dengan *Umrava Premium* (hanya Rp49.000 — sekali bayar, akses seumur hidup), Anda mendapatkan:

✅ Al-Quran 114 surah + murottal Mishary Rashid
✅ Zikir Pagi & Petang Al-Banna (audio + counter)
✅ Panduan ibadah step-by-step + counter tawaf/sa'i
✅ Kompas kiblat & jadwal shalat real-time
✅ Packing list 57 item + tracker persiapan umroh
✅ Kalkulator biaya umroh mandiri
✅ Update fitur seumur hidup tanpa biaya tambahan

Semoga Allah memudahkan langkah ${nama} meraih umroh yang mabrur, maqbul, dan penuh keberkahan. Barakallah fiik. 🌙

Silakan upgrade di sini 👇
https://umrava.com/dashboard/upgrade

Wassalamu'alaikum Warahmatullahi Wabarakatuh
*Tim Umrava* 🕋`.trim()
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [waUser, setWaUser] = useState<UserRow | null>(null)
  const [copied, setCopied] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page), limit: String(PAGE_SIZE),
      ...(search && { search }),
      ...(planFilter && { plan: planFilter }),
    })
    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(data.users ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, search, planFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const updateUser = async (userId: string, updates: { plan?: string; is_admin?: boolean }) => {
    setUpdating(true)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...updates }),
    })
    const data = await res.json()
    if (data.error) toast.error(data.error)
    else {
      toast.success('User berhasil diupdate')
      fetchUsers()
      if (selectedUser?.id === userId && data.user) setSelectedUser(data.user)
    }
    setUpdating(false)
  }

  const deleteUser = async (userId: string) => {
    setDeleting(true)
    const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.error) {
      toast.error(data.error)
    } else {
      toast.success('User berhasil dihapus')
      setSelectedUser(null)
      setConfirmDelete(false)
      fetchUsers()
    }
    setDeleting(false)
  }

  const resetPassword = async (userId: string) => {
    setUpdating(true)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'reset_password' }),
    })
    const data = await res.json()
    if (data.error) toast.error(data.error)
    else toast.success(`✅ Password direset ke "Umrava26"`)
    setUpdating(false)
    setConfirmReset(false)
  }

  const copyWa = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Pesan WA tersalin!')
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const premiumCount = users.filter(u => u.plan === 'premium').length

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Manajemen User</h1>
          <p className="text-gray-500 text-sm">{total} total user</p>
        </div>
        <button onClick={fetchUsers}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Cari nama atau email..."
              className="flex-1 text-sm outline-none"
            />
          </div>
          <div className="flex gap-2">
            {[
              { val: '', label: 'Semua' },
              { val: 'free', label: 'Free' },
              { val: 'premium', label: '✨ Premium' },
            ].map(f => (
              <button key={f.val} onClick={() => { setPlanFilter(f.val); setPage(1) }}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                  planFilter === f.val ? 'bg-[#1B6B3A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Ditampilkan', val: users.length },
          { label: 'Premium di halaman ini', val: premiumCount },
          { label: 'Revenue estimasi', val: formatRupiah(total * 0.05 * 49000) },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
            <div className="text-lg font-black text-gray-900">{s.val}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
            <p className="text-sm">Memuat data...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-gray-400"><p>Tidak ada user ditemukan</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Plan', 'Kota', 'Keberangkatan', 'Bergabung', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E8F5ED] flex items-center justify-center text-[#1B6B3A] font-bold text-sm flex-shrink-0">
                          {((user.full_name ?? user.email) || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                            {user.full_name ?? <span className="text-gray-400 italic">Tanpa nama</span>}
                            {user.is_admin && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
                          </div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full',
                        user.plan === 'premium' ? 'bg-[#F5E6C8] text-[#8B6914]' : 'bg-gray-100 text-gray-500'
                      )}>
                        {user.plan === 'premium' ? <Crown size={11} /> : null}
                        {user.plan === 'premium' ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.city ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.departure_date ? new Date(user.departure_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedUser(user)}
                          className="flex items-center gap-1 text-xs text-[#1B6B3A] hover:text-[#0D4A28] font-semibold">
                          <UserCog size={13} /> Kelola
                        </button>
                        {user.plan === 'free' && (
                          <button onClick={() => setWaUser(user)}
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-semibold">
                            <MessageCircle size={13} /> WA
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
            <div className="text-sm text-gray-500">Halaman {page} dari {totalPages}</div>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── User Detail Drawer ── */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-sm bg-white h-full overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Detail User</h2>
              <button onClick={() => { setSelectedUser(null); setConfirmReset(false); setConfirmDelete(false) }} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#E8F5ED] flex items-center justify-center text-[#1B6B3A] font-black text-2xl mx-auto mb-2">
                  {((selectedUser.full_name ?? selectedUser.email) || 'U')[0].toUpperCase()}
                </div>
                <div className="font-bold text-gray-900">{selectedUser.full_name ?? 'Tanpa nama'}</div>
                <div className="text-sm text-gray-400">{selectedUser.email}</div>
                {selectedUser.is_admin && <span className="inline-block mt-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">ADMIN</span>}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                {[
                  { label: 'Plan', val: selectedUser.plan === 'premium' ? '✨ Premium' : 'Free' },
                  { label: 'WhatsApp', val: selectedUser.phone ? `+62${selectedUser.phone}` : '—' },
                  { label: 'Kota', val: selectedUser.city ?? 'Belum diset' },
                  { label: 'Keberangkatan', val: selectedUser.departure_date ? new Date(selectedUser.departure_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum diset' },
                  { label: 'Bergabung', val: new Date(selectedUser.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Premium sejak', val: selectedUser.premium_activated_at ? new Date(selectedUser.premium_activated_at).toLocaleDateString('id-ID') : '—' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-semibold text-gray-800">{item.val}</span>
                  </div>
                ))}
              </div>

              {/* Aksi Plan */}
              <div>
                <h3 className="font-bold text-gray-700 text-sm mb-3">Aksi Admin</h3>
                <div className="space-y-2">
                  {selectedUser.plan === 'free' ? (
                    <>
                      <button onClick={() => updateUser(selectedUser.id, { plan: 'premium' })} disabled={updating}
                        className="w-full bg-[#C9A84C] hover:bg-[#b8963d] disabled:bg-gray-300 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                        <Crown size={16} /> Upgrade ke Premium
                      </button>
                      <button onClick={() => setWaUser(selectedUser)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                        <MessageCircle size={16} /> Follow Up via WhatsApp
                      </button>
                    </>
                  ) : (
                    <button onClick={() => updateUser(selectedUser.id, { plan: 'free' })} disabled={updating}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm transition-colors">
                      Downgrade ke Free
                    </button>
                  )}

                  <button onClick={() => updateUser(selectedUser.id, { is_admin: !selectedUser.is_admin })} disabled={updating}
                    className={cn('w-full py-3 rounded-xl font-bold text-sm transition-colors',
                      selectedUser.is_admin ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                    )}>
                    {selectedUser.is_admin ? '🚫 Cabut akses Admin' : '🔑 Jadikan Admin'}
                  </button>

                  {/* Reset Password */}
                  {!confirmReset ? (
                    <button onClick={() => setConfirmReset(true)}
                      className="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                      <KeyRound size={15} /> Reset Password
                    </button>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <p className="text-sm text-orange-700 font-semibold mb-1">Reset password?</p>
                      <p className="text-xs text-orange-600 mb-3">
                        Password akan direset ke <code className="bg-orange-100 px-1.5 py-0.5 rounded font-mono font-bold">Umrava26</code>.
                        User harus ganti password setelah login.
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmReset(false)}
                          className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                          Batal
                        </button>
                        <button onClick={() => resetPassword(selectedUser.id)} disabled={updating}
                          className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold disabled:opacity-50">
                          {updating ? 'Mereset...' : 'Ya, Reset'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
                ⚠️ Pastikan tindakan ini sudah benar. Perubahan langsung berlaku.
              </div>

              {/* Danger Zone: Hapus User */}
              {!selectedUser.is_admin && (
                <div className="border border-red-200 rounded-xl overflow-hidden">
                  <div className="bg-red-50 px-4 py-2.5 flex items-center gap-2">
                    <Trash2 size={13} className="text-red-500" />
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Danger Zone</span>
                  </div>
                  {!confirmDelete ? (
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-3">Hapus permanen akun dan seluruh data user ini.</p>
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={14} /> Hapus User
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50">
                      <p className="text-sm font-bold text-red-700 mb-1">Yakin hapus user ini?</p>
                      <p className="text-xs text-red-600 mb-3">
                        Semua data akan dihapus permanen — ibadah, checklist, itinerary, catatan, pembayaran. <strong>Tidak bisa dibatalkan.</strong>
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmDelete(false)}
                          className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-white">
                          Batal
                        </button>
                        <button onClick={() => deleteUser(selectedUser.id)} disabled={deleting}
                          className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-1.5">
                          {deleting ? 'Menghapus...' : <><Trash2 size={13} /> Ya, Hapus</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── WA Follow-up Modal ── */}
      {waUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <MessageCircle size={18} className="text-green-500" /> Follow Up WhatsApp
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{waUser.full_name ?? waUser.email}</p>
              </div>
              <button onClick={() => { setWaUser(null); setCopied(false) }} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <div className="bg-[#E7FFDB] rounded-2xl p-4 mb-4 max-h-72 overflow-y-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {buildWaMessage(waUser)}
                </pre>
              </div>

              <p className="text-xs text-gray-400 mb-4">
                Salin pesan lalu kirim ke nomor WA user, atau buka WA Web dan pilih kontaknya.
              </p>

              {waUser.phone && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between text-sm">
                  <span className="text-green-700 font-medium">📱 +62{waUser.phone}</span>
                  <span className="text-green-500 text-xs">Nomor terdaftar</span>
                </div>
              )}
              {!waUser.phone && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 mb-4 text-xs text-yellow-700">
                  ⚠️ User belum mengisi nomor WhatsApp — salin pesan dan kirim manual.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => copyWa(buildWaMessage(waUser))}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all',
                    copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {copied ? <><Check size={15} /> Tersalin!</> : <><Copy size={15} /> Salin Pesan</>}
                </button>
                <a
                  href={waUser.phone
                    ? `https://wa.me/62${waUser.phone}?text=${encodeURIComponent(buildWaMessage(waUser))}`
                    : `https://web.whatsapp.com/send?text=${encodeURIComponent(buildWaMessage(waUser))}`
                  }
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors"
                >
                  <ExternalLink size={15} /> {waUser.phone ? 'Kirim WA' : 'Buka WA Web'}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
