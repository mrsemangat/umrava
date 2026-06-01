'use client'
import { useState } from 'react'
import { Crown, X } from 'lucide-react'
import { UpgradeModal } from './UpgradeModal'

export function UpgradeBanner() {
  const [showModal, setShowModal] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <>
      <div className="relative bg-gradient-to-r from-[#0D4A28] to-[#1B6B3A] rounded-2xl p-5 mb-6 text-white overflow-hidden">
        {/* subtle pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z'/%3E%3C/g%3E%3C/svg%3E\")" }} />

        <button onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 text-white/40 hover:text-white/80 transition-colors">
          <X size={16} />
        </button>

        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C9A84C] flex items-center justify-center flex-shrink-0 shadow-lg">
            <Crown size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base mb-0.5">Upgrade ke Premium</div>
            <div className="text-white/70 text-xs leading-relaxed">
              Buka kalkulator biaya, itinerary builder, semua spot foto & tracker lengkap — hanya <strong className="text-[#C9A84C]">Rp 49.000</strong> sekali bayar.
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex-shrink-0 bg-[#C9A84C] hover:bg-[#b8963d] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md whitespace-nowrap">
            Upgrade ✨
          </button>
        </div>
      </div>

      {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}
    </>
  )
}
