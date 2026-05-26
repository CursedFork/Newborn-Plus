'use client'

import { useState, useEffect, useCallback } from 'react'
import { Baby, Droplets, Moon, Activity, Hash, Gauge, Scale } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useBaby } from '@/contexts/BabyContext'
import { useAppearance } from '@/contexts/AppearanceContext'
import { formatVolume, ML_PER_OZ } from '@/lib/units'
import { createClient } from '@/lib/supabase/client'
import StatusCard from '@/components/home/StatusCard'
import QuickLogButton from '@/components/home/QuickLogButton'
import BottleTimerCard from '@/components/home/BottleTimerCard'
import IntakeChart from '@/components/home/IntakeChart'
import FeedModal from '@/components/log/FeedModal'
import DiaperModal from '@/components/log/DiaperModal'
import PumpModal from '@/components/log/PumpModal'
import SleepModal from '@/components/log/SleepModal'
import WeightModal from '@/components/log/WeightModal'
import { NoBabyPrompt } from '@/components/home/NoBabyPrompt'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Database, DailyRollupRow } from '@/lib/database.types'

type Feed = Database['public']['Tables']['feeds']['Row']
type Diaper = Database['public']['Tables']['diapers']['Row']
type ActiveModal = 'feed' | 'diaper' | 'pump' | 'sleep' | 'weight' | null

/** Returns today's YYYY-MM-DD date in the given IANA timezone. */
function todayInTz(tz: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
}

/** Returns the YYYY-MM-DD date N days ago in the given IANA timezone. */
function nDaysAgoInTz(n: number, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(
    new Date(Date.now() - n * 24 * 60 * 60 * 1000)
  )
}

export default function HomePage() {
  const { baby, loading } = useBaby()
  const { volumeUnit } = useAppearance()
  const supabase = createClient()

  const [activeModal, setActiveModal] = useState<ActiveModal>(null)
  const [lastFeed, setLastFeed] = useState<Feed | null>(null)
  const [lastDiaper, setLastDiaper] = useState<Diaper | null>(null)
  const [activeFeeds, setActiveFeeds] = useState<Feed[]>([])
  const [dismissedFeedIds, setDismissedFeedIds] = useState<Set<string>>(new Set())
  const [weekRollup, setWeekRollup] = useState<DailyRollupRow[]>([])

  const fetchAll = useCallback(async () => {
    if (!baby) return
    const tz = baby.timezone ?? 'America/New_York'
    const todayStr = todayInTz(tz)
    const sevenDaysAgoStr = nDaysAgoInTz(6, tz)

    const [
      { data: feedData },
      { data: diaperData },
      { data: activeFeedsData },
      { data: rollupData },
    ] = await Promise.all([
      supabase
        .from('feeds').select('*').eq('baby_id', baby.id)
        .order('start_at', { ascending: false }).limit(1).single(),
      supabase
        .from('diapers').select('*').eq('baby_id', baby.id)
        .order('changed_at', { ascending: false }).limit(1).single(),
      supabase
        .from('feeds').select('*').eq('baby_id', baby.id)
        .is('end_at', null)
        .gte('start_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
        .order('start_at', { ascending: false }),
      supabase
        .from('daily_rollup').select('*').eq('baby_id', baby.id)
        .gte('day', sevenDaysAgoStr).lte('day', todayStr)
        .order('day', { ascending: true }),
    ])

    if (feedData) setLastFeed(feedData)
    if (diaperData) setLastDiaper(diaperData)
    setActiveFeeds(activeFeedsData ?? [])
    setWeekRollup(rollupData ?? [])
  }, [baby, supabase])

  useEffect(() => { fetchAll() }, [fetchAll])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading…</p>
      </div>
    )
  }

  if (!baby) return <NoBabyPrompt />

  // ── Derived stats ────────────────────────────────────────────────────────
  const tz = baby.timezone ?? 'America/New_York'
  const todayStr = todayInTz(tz)
  const todayRollup = weekRollup.find((r) => r.day === todayStr) ?? null

  const todayTotalMl = todayRollup
    ? Math.round(todayRollup.formula_ml + todayRollup.breast_milk_ml + todayRollup.colostrum_ml)
    : 0
  const todayFeedCount = todayRollup?.feed_count ?? 0
  const todayAvgMl = todayFeedCount > 0 ? Math.round(todayTotalMl / todayFeedCount) : 0

  // Display values in preferred unit
  const displayTotal = volumeUnit === 'oz'
    ? (todayTotalMl / ML_PER_OZ).toFixed(1)
    : String(todayTotalMl)
  const displayAvg = formatVolume(todayAvgMl, volumeUnit)

  const ageDays = Math.floor(
    (Date.now() - new Date(baby.birth_date + 'T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="flex flex-col gap-4 p-4 pt-6 pb-24 max-w-lg mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{baby.name}</h1>
        <span className="text-sm text-muted-foreground font-medium">Day {ageDays}</span>
      </div>

      {/* ── Hero: today's intake ────────────────────────────────────────── */}
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
            Today&apos;s Intake
          </p>
          <div className="flex items-end gap-2 mb-1">
            <span className="text-5xl font-bold tabular-nums leading-none">
              {displayTotal}
            </span>
            <span className="text-xl font-medium text-muted-foreground mb-1">{volumeUnit}</span>
          </div>
          {todayFeedCount > 0 ? (
            <p className="text-sm text-muted-foreground">
              {todayFeedCount} feed{todayFeedCount !== 1 ? 's' : ''} &middot; avg {displayAvg}/feed
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No feeds logged yet today</p>
          )}
        </CardContent>
      </Card>

      {/* ── Status row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <StatusCard
          icon={<Baby className="h-4 w-4" />}
          label="Last feed"
          value={lastFeed
            ? formatDistanceToNow(new Date(lastFeed.start_at), { addSuffix: true })
            : '—'}
        />
        <StatusCard
          icon={<Droplets className="h-4 w-4" />}
          label="Last diaper"
          value={lastDiaper
            ? formatDistanceToNow(new Date(lastDiaper.changed_at), { addSuffix: true })
            : '—'}
        />
        <StatusCard
          icon={<Hash className="h-4 w-4" />}
          label="Feeds today"
          value={todayFeedCount > 0 ? String(todayFeedCount) : '—'}
          size="lg"
        />
        <StatusCard
          icon={<Gauge className="h-4 w-4" />}
          label="Avg per feed"
          value={todayAvgMl > 0 ? displayAvg : '—'}
          size="lg"
        />
      </div>

      {/* ── 7-day chart ────────────────────────────────────────────────── */}
      {weekRollup.length > 0 && (
        <Card>
          <CardHeader className="pt-4 pb-0 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              7-Day Intake
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pt-2 pb-3">
            <IntakeChart data={weekRollup} unit={volumeUnit} />
            {/* legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 px-2">
              {weekRollup.some((r) => r.formula_ml > 0) && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500" />
                  Formula
                </span>
              )}
              {weekRollup.some((r) => r.breast_milk_ml > 0) && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-pink-500" />
                  Breast milk
                </span>
              )}
              {weekRollup.some((r) => r.colostrum_ml > 0) && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500" />
                  Colostrum
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Active bottle timers ────────────────────────────────────────── */}
      {activeFeeds.filter((f) => !dismissedFeedIds.has(f.id)).length > 0 && (
        <div className="space-y-2">
          {activeFeeds
            .filter((f) => !dismissedFeedIds.has(f.id))
            .map((feed) => (
              <BottleTimerCard
                key={feed.id}
                feed={feed}
                onDismiss={() => setDismissedFeedIds((prev) => new Set([...prev, feed.id]))}
              />
            ))}
        </div>
      )}

      {/* ── Quick-log grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
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
        <div className="col-span-2">
          <QuickLogButton
            icon={<Scale className="h-6 w-6" />}
            label="Weight"
            color="bg-emerald-500 hover:bg-emerald-600"
            onClick={() => setActiveModal('weight')}
          />
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      <FeedModal
        open={activeModal === 'feed'} babyId={baby.id}
        onClose={() => setActiveModal(null)} onSaved={fetchAll}
      />
      <DiaperModal
        open={activeModal === 'diaper'} babyId={baby.id}
        onClose={() => setActiveModal(null)} onSaved={fetchAll}
      />
      <PumpModal
        open={activeModal === 'pump'} babyId={baby.id}
        onClose={() => setActiveModal(null)} onSaved={fetchAll}
      />
      <SleepModal
        open={activeModal === 'sleep'} babyId={baby.id}
        onClose={() => setActiveModal(null)} onSaved={fetchAll}
      />
      <WeightModal
        open={activeModal === 'weight'} babyId={baby.id}
        onClose={() => setActiveModal(null)} onSaved={fetchAll}
      />
    </div>
  )
}
