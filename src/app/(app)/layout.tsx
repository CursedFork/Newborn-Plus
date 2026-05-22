import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BabyProvider } from '@/contexts/BabyContext'
import { AppearanceProvider } from '@/contexts/AppearanceContext'
import ThemeBackground from '@/components/ThemeBackground'
import BottomNav from '@/components/home/BottomNav'
import PwaManager from '@/components/PwaManager'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <AppearanceProvider>
      <ThemeBackground />
      <BabyProvider>
        <PwaManager />
        <div className="flex min-h-dvh flex-col">
          <main className="flex-1 pb-20">{children}</main>
          <BottomNav />
        </div>
      </BabyProvider>
    </AppearanceProvider>
  )
}
