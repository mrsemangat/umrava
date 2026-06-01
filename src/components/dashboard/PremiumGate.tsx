'use client'
import { useState } from 'react'
import { Crown, Lock } from 'lucide-react'
import { UpgradeModal } from './UpgradeModal'

interface PremiumGateProps {
  children: React.ReactNode
  isPremium: boolean
  featureName?: string
  description?: string
}

export function PremiumGate({ children, isPremium, featureName = 'Fitur Premium', description }: PremiumGateProps) {
  const [showModal, setShowModal] = useState(false)

  if (isPremium) return <>{children}</>

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden">
        {/* Blurred content preview */}
        <div className="pointer-events-none select-none" style={{ filter: 'blur(4px)', opacity: 0.4 }}>
          {children}
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-[#C9A84C] flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Lock size={24} className="text-white" />
            </div>
            <div className="font-bold text-[#0D4A28] text-base mb-1">{featureName}</div>
            {description && (
              <p className="text-xs text-gray-500 mb-4 max-w-48 mx-auto leading-relaxed">{description}</p>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8963d] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all mx-auto shadow-md">
              <Crown size={15} /> Upgrade Rp49.000
            </button>
          </div>
        </div>
      </div>

      {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}
    </>
  )
}

// Compact inline lock badge — untuk tombol/section kecil
export function PremiumBadge({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 bg-[#F5E6C8] hover:bg-[#C9A84C] text-[#8B6914] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
      <Crown size={11} /> Premium
    </button>
  )
}
