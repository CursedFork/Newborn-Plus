'use client'

import { useState, useEffect, useCallback } from 'react'
import { Baby, Droplets, Moon, Activity } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useBaby } from '@/contexts/BabyContext'
import { createClient } from '@/lib/supabase/client'
import StatusCard from '@/components/home/StatusCard'
import QuickLogButton from '@/components/home/QuickLogButton'
import BottleTimerCard from '@/components/home/BottleTimerCard'
import FeedModal from '@/components/log/FeedModal'
import DiaperModal from '@/components/log/DiaperModal'
import PumpModal from '@/components/log/PumpModal'
import SleepModal from '@/components/log/SleepModal'
import { NoBabyPrompt } from '@/components/home/NoBabyPrompt'
import type { Database } from '@/lib/database.types'

type Feed = Database['public']['Tables']['feeds']['Row']
type Diaper = Database['public']['Tables']['diapers']['Row']

type ActiveModal = 'feed' | 'diaper' | 'pump' | 'sleep' | null

export default function HomePage() {
  const { baby, loading } = useBaby()
  const supabase = createClient()

  const [activeModal, setActiveModal] = useState<ActiveModal>(null)
  const [lastFeed, setLastFeed] = useState<Feed | null>(null)
  const [lastDiaper, setLastDiaper] = useState<Diaper | null>(null)
  const [activeFeeds, setActiveFeeds] = useState<Feed[]>([])

  const fetchRecent = useCallback(async () => {
    if (!baby) return

    const { data: feedData } = await supabase
      .from('feeds')
      .select('*')
      .eq('baby_id', baby.id)
      .order('start_at', { ascending: false })
      .limit(1)
      .single()

    const { data: diaperData } = await supabase
      .from('diapers')
      .select('*')
      .eq('baby_id', baby.id)
      .order('changed_at', { ascending: false })
      .limit(1)
      .single()

    const { data: activeFeedsData } = await supabase
      .from('feeds')
      .select('*')
      .eq('baby_id', baby.id)
      .is('end_at', null)
      .gte('start_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
      .order('start_at', { ascending: false })

    if (feedData) setLastFeed(feedData)
    if (diaperData) setLastDiaper(diaperData)
    if (activeFeedsData) setActiveFeeds(activeFeedsData)
  }, [baby, supabase])

  useEffect(() => {
    fetchRecent()
  }, [fetchRecent])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading…</p>
      </div>
    )
  }

  if (!baby) return <NoBabyPrompt />

  const ageDays = Math.floor(
    (Date.now() - new Date(baby.birth_date + 'T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="flex flex-col gap-4 p-4 pt-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">{baby.name}</h1>
        <p className="text-muted-foreground text-sm">Day {ageDays} of life</p>
      </div>

      {/* Active bottle timers */}
      {activeFeeds.length > 0 && (
        <div className="space-y-2">
          {activeFeeds.map((feed) => (
            <BottleTimerCard key={feed.id} feed={feed} />
          ))}
        </div>
      )}

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatusCard
          icon={<Baby className="h-4 w-4" />}
          label="Last feed"
          value={lastFeed ? formatDistanceToNow(new Date(lastFeed.start_at), { addSuffix: true }) : '—'}
        />
        <StatusCard
          icon={<Droplets className="h-4 w-4" />}
          label="Last diaper"
          value={lastDiaper ? formatDistanceToNow(new Date(lastDiaper.changed_at), { addSuffix: true }) : '—'}
        />
      </div>

      {/* Quick-log buttons */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <QuickLogButton
          icon={<Baby className="h-6 w-6" />}
          label="Feed"
          color="bg-blue-500 hover:bg-blue-600"
          onClick={() => setActiveModal('feed')}
        />
        <QuickLogButton
          icon={<Droplets className="h-6 w-6" />}
          label="Diaper"
          color="bg-yellow-500 hover:bg-yellow-600"
          onClick={() => setActiveModal('diaper')}
        />
        <QuickLogButton
          icon={<Activity className="h-6 w-6" />}
          label="Pump"
          color="bg-pink-500 hover:bg-pink-600"
          onClick={() => setActiveModal('pump')}
        />
        <QuickLogButton
          icon={<Moon className="h-6 w-6" />}
          label="Sleep"
          color="bg-indigo-500 hover:bg-indigo-600"
          onClick={() => setActiveModal('sleep')}
        />
      </div>

      {/* Logging modals */}
      <FeedModal
        open={activeModal === 'feed'}
        babyId={baby.id}
        onClose={() => setActiveModal(null)}
        onSaved={fetchRecent}
      />
      <DiaperModal
        open={activeModal === 'diaper'}
        babyId={baby.id}
        onClose={() => setActiveModal(null)}
        onSaved={fetchRecent}
      />
      <PumpModal
        open={activeModal === 'pump'}
        babyId={baby.id}
        onClose={() => setActiveModal(null)}
        onSaved={fetchRecent}
      />
      <SleepModal
        open={activeModal === 'sleep'}
        babyId={baby.id}
        onClose={() => setActiveModal(null)}
        onSaved={fetchRecent}
      />
    </div>
  )
}
