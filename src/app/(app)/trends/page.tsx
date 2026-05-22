'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBaby } from '@/contexts/BabyContext'
import ExportCharts from '@/components/export/ExportCharts'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { FeedRow, DiaperRow, PumpRow, WeightRow, DailyRollupRow } from '@/lib/database.types'

type Range = '24h' | '7d' | '14d' | '30d'

function rangeStart(r: Range): string {
  const ms = { '24h': 86400000, '7d': 7 * 86400000, '14d': 14 * 86400000, '30d': 30 * 86400000 }
  return new Date(Date.now() - ms[r]).toISOString()
}

export default function TrendsPage() {
  const supabase = createClient()
  const { baby, loading: babyLoading } = useBaby()
  const [range, setRange] = useState<Range>('7d')
  const [fetching, setFetching] = useState(false)
  const [rollup, setRollup] = useState<DailyRollupRow[]>([])
  const [feeds, setFeeds] = useState<FeedRow[]>([])
  const [pumps, setPumps] = useState<PumpRow[]>([])
  const [weights, setWeights] = useState<WeightRow[]>([])

  const fetchData = useCallback(async () => {
    if (!baby) return
    setFetching(true)
    const since = rangeStart(range)

    const { data: fData } = await supabase.from('feeds').select('*').eq('baby_id', baby.id).gte('start_at', since).order('start_at')
    setFeeds((fData as FeedRow[]) ?? [])

    const { data: pData } = await supabase.from('pumps').select('*').eq('baby_id', baby.id).gte('start_at', since).order('start_at')
    setPumps((pData as PumpRow[]) ?? [])

    const { data: wData } = await supabase.from('weights').select('*').eq('baby_id', baby.id).order('measured_at')
    setWeights((wData as WeightRow[]) ?? []) // all weights for WHO chart

    const sinceDate = since.slice(0, 10)
    const { data: rData } = await supabase.from('daily_rollup').select('*').eq('baby_id', baby.id).gte('day', sinceDate).order('day')
    setRollup((rData as DailyRollupRow[]) ?? [])

    setFetching(false)
  }, [baby, range, supabase])

  useEffect(() => {
    if (!babyLoading && baby) fetchData()
  }, [babyLoading, baby, fetchData])

  if (babyLoading) {
    return (
      <div className="p-4 pt-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!baby) {
    return <div className="p-4 pt-6"><p className="text-muted-foreground">No baby profile found.</p></div>
  }

  const RANGES: { value: Range; label: string }[] = [
    { value: '24h', label: '24 h' },
    { value: '7d', label: '7 days' },
    { value: '14d', label: '14 days' },
    { value: '30d', label: '30 days' },
  ]

  return (
    <div className="p-4 pt-6 pb-24 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">Trends</h1>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <Button
              key={r.value}
              variant={range === r.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {fetching ? (
        <div className="space-y-8">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      ) : (
        <ExportCharts
          rollup={rollup}
          feeds={feeds}
          pumps={pumps}
          weights={weights}
          babyBirthDate={baby.birth_date}
          babySex={baby.sex}
        />
      )}

      <p className="text-xs text-muted-foreground">
        Data reflects UTC calendar days. Your pediatrician can help interpret trends — this is not medical advice.
      </p>
    </div>
  )
}
