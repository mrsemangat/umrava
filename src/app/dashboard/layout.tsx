import { Sidebar } from '@/components/dashboard/Sidebar'
import { PlanProvider } from '@/components/dashboard/PlanProvider'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: checklist } = await supabase
    .from('checklist_progress')
    .select('item_id')
    .eq('user_id', user.id)
    .eq('checked', true)

  const totalItems = 32
  const progress = Math.round(((checklist?.length ?? 0) / totalItems) * 100)
  const isPremium = profile?.plan === 'premium'

  return (
    <PlanProvider isPremium={isPremium}>
      <div className="min-h-screen bg-[#FBF7F0]">
        <Sidebar
          userName={profile?.full_name}
          departureDate={profile?.departure_date}
          prepProgress={progress}
          isPremium={isPremium}
        />
        <main className="lg:ml-64 min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </PlanProvider>
  )
}
