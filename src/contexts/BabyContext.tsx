'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'

type Baby = Database['public']['Tables']['babies']['Row']
type Caregiver = Database['public']['Tables']['caregivers']['Row']

interface BabyContextValue {
  baby: Baby | null
  caregiver: Caregiver | null
  loading: boolean
  refresh: () => void
}

const BabyContext = createContext<BabyContextValue>({
  baby: null,
  caregiver: null,
  loading: true,
  refresh: () => {},
})

export function BabyProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [baby, setBaby] = useState<Baby | null>(null)
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: cg } = await supabase
      .from('caregivers')
      .select('*, babies(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (cg) {
      setCaregiver(cg as unknown as Caregiver)
      setBaby((cg as unknown as { babies: Baby }).babies)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  return (
    <BabyContext.Provider value={{ baby, caregiver, loading, refresh: load }}>
      {children}
    </BabyContext.Provider>
  )
}

export function useBaby() {
  return useContext(BabyContext)
}
