'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, ChevronRight, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin', icon: '📊', label: 'Overview' },
  { href: '/admin/users', icon: '👥', label: 'Manajemen User' },
  { href: '/admin/paket', icon: '👑', label: 'Manajemen Paket' },
  { href: '/admin/content', icon: '📝', label: 'Manajemen Konten' },
  { href: '/admin/analytics', icon: '📈', label: 'Analytics' },
]

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const logout = async () => {
    await createClient().auth.signOut()
    router.push('/auth/login')
  }

  const Content = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C9A84C] flex items-center justify-center text-lg font-bold text-white shadow">🕋</div>
          <div>
            <div className="text-white font-bold text-base leading-tight">BaitGo</div>
            <div className="text-xs text-gray-400 font-medium">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-1">
        {NAV.map(item => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-[#C9A84C] text-white shadow-sm'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}>
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-5 border-t border-gray-800 pt-4">
        <div className="px-4 py-2 mb-3">
          <div className="text-xs text-gray-500 mb-0.5">Login sebagai</div>
          <div className="text-sm text-white font-medium truncate">{adminName}</div>
          <div className="text-xs text-[#C9A84C] font-semibold">Admin</div>
        </div>
        <Link href="/dashboard" onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all mb-1">
          <span>🏠</span> Ke Dashboard User
        </Link>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all">
          <LogOut size={15} /> Keluar
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-gray-900 fixed left-0 top-0 z-30">
        <Content />
      </aside>

      <button onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-gray-900 text-[#C9A84C] flex items-center justify-center shadow-lg">
        <Menu size={20} />
      </button>

      {open && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-gray-900 z-50 flex flex-col overflow-y-auto">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <Content />
          </aside>
        </>
      )}
    </>
  )
}
