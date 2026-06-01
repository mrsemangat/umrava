'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Menu, X, ChevronRight, Crown } from 'lucide-react'
import { UpgradeModal } from './UpgradeModal'

const NAV_ITEMS = [
  { href: '/dashboard', icon: '🏠', label: 'Beranda' },
  { href: '/dashboard/panduan', icon: '🕌', label: 'Panduan Ibadah' },
  { href: '/dashboard/doa', icon: '🤲', label: 'Bank Doa' },
  { href: '/dashboard/zikir', icon: '☀️', label: 'Zikir Pagi & Petang', premium: true },
  { href: '/dashboard/perencanaan', icon: '📋', label: 'Perencanaan' },
  { href: '/dashboard/spot-foto', icon: '📸', label: 'Spot Foto' },
  { href: '/dashboard/panduan-praktis', icon: '🗺️', label: 'Panduan Praktis' },
  { href: '/dashboard/tracker', icon: '✅', label: 'Tracker Persiapan' },
]

interface SidebarProps {
  userName?: string
  departureDate?: string
  prepProgress?: number
  isPremium?: boolean
}

export function Sidebar({ userName = 'Jamaah', departureDate, prepProgress = 0, isPremium = false }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const daysLeft = departureDate
    ? Math.max(0, Math.ceil((new Date(departureDate).getTime() - Date.now()) / 86400000))
    : null

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[rgba(201,168,76,0.2)]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C9A84C] flex items-center justify-center text-xl shadow-md">
            🕋
          </div>
          <div>
            <div className="text-[#F5E6C8] font-bold text-lg leading-tight">BaitGo</div>
            <div className="text-[#C9A84C] text-xs">Panduan Umroh</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[rgba(201,168,76,0.2)] text-[#C9A84C]'
                  : 'text-[rgba(251,247,240,0.7)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#FBF7F0]'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {'premium' in item && item.premium && !isPremium && (
                <span className="text-[8px] font-bold bg-[#C9A84C]/30 text-[#C9A84C] px-1.5 py-0.5 rounded-full ml-1">PRO</span>
              )}
              {isActive && <ChevronRight size={14} className="ml-1" />}
            </Link>
          )
        })}
      </nav>

      {/* Progress card */}
      <div className="mx-4 mb-4 p-4 rounded-xl bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.2)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#C9A84C] font-semibold">Persiapan</span>
          <span className="text-xs text-[#F5E6C8] font-bold">{prepProgress}%</span>
        </div>
        <div className="h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C9A84C] rounded-full transition-all duration-500"
            style={{ width: `${prepProgress}%` }}
          />
        </div>
        {daysLeft !== null && (
          <div className="mt-3 text-center">
            <div className="text-[#C9A84C] font-bold text-lg">H-{daysLeft}</div>
            <div className="text-[rgba(251,247,240,0.6)] text-xs">hari menuju Tanah Suci 🕌</div>
          </div>
        )}
      </div>

      {/* Upgrade CTA untuk free user */}
      {!isPremium && (
        <div className="mx-4 mb-3">
          <button
            onClick={() => { setShowUpgrade(true); setMobileOpen(false) }}
            className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#b8963d] text-white py-2.5 rounded-xl text-sm font-bold transition-all"
          >
            <Crown size={14} /> Upgrade Premium
          </button>
          <p className="text-center text-[10px] text-[rgba(251,247,240,0.4)] mt-1.5">Rp49.000 sekali bayar</p>
        </div>
      )}

      {/* Plan badge */}
      {isPremium && (
        <div className="mx-4 mb-3 flex items-center justify-center gap-2 bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.3)] py-2 rounded-xl">
          <Crown size={13} className="text-[#C9A84C]" />
          <span className="text-xs font-bold text-[#C9A84C]">Akun Premium</span>
        </div>
      )}

      {/* Settings link */}
      <div className="px-4 pb-4 pt-2 border-t border-[rgba(201,168,76,0.2)]">
        <Link
          href="/dashboard/settings"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[rgba(251,247,240,0.6)] hover:text-[#FBF7F0] hover:bg-[rgba(255,255,255,0.06)] transition-all"
        >
          <span className="text-lg">⚙️</span>
          <span>Pengaturan</span>
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-[#0D4A28] fixed left-0 top-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-[#0D4A28] text-[#C9A84C] flex items-center justify-center shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#0D4A28] z-50 flex flex-col overflow-y-auto">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-[rgba(251,247,240,0.6)] hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
