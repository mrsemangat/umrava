'use client'
import { createContext, useContext } from 'react'

const PlanCtx = createContext<{ isPremium: boolean }>({ isPremium: false })

export function PlanProvider({ isPremium, children }: { isPremium: boolean; children: React.ReactNode }) {
  return <PlanCtx.Provider value={{ isPremium }}>{children}</PlanCtx.Provider>
}

export function usePlan() {
  return useContext(PlanCtx)
}
