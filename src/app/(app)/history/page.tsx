'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBaby } from '@/contexts/BabyContext'
import { formatLocalDateTime } from '@/lib/export-utils'
import { formatOz } from '@/lib/who/percentiles'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { FeedRow, DiaperRow, PumpRow, SleepRow, WeightRow, PedNoteRow } from '@/lib/database.types'

interface HistoryItem {
  at: string
  type: 'feed' | 'diaper' | 'pump' | 'sleep' | 'weight' | 'ped_note'
  summary: string
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive'
}

function feedSummary(f: FeedRow): HistoryItem {
  const typeName = f.type === 'breast_milk' ? 'Breast milk' : f.type === 'colostrum' ? 'Colostrum' : 'Formula'
  const parts = [`${f.volume_ml} ml ${typeName}`]
  if (f.formula_brand) parts.push(`(${f.formula_brand})`)
  if (f.spit_up) parts.push('· spit-up')
  if (f.volume_offered_ml && f.volume_ml < f.volume_offered_ml * 0.5) parts.push('· refused')
  return { at: f.start_at, type: 'feed', summary: parts.join(' '), badge: 'Feed', badgeVariant: 'default' }
}

function diaperSummary(d: DiaperRow): HistoryItem {
  const what = [d.pee && 'pee', d.poop && 'poop'].filter(Boolean).join(' + ')
  const parts = [what]
  if (d.poop_color) parts.push(`· ${d.poop_color.replace('_', ' ')}`)
  if (d.rash_status && d.rash_status !== 'none') parts.push(`· rash: ${d.rash_status}`)
  if (d.cream_applied && d.cream_applied !== 'none') parts.push(`· ${d.cream_applied.replace('_', ' ')}`)
  return { at: d.changed_at, type: 'diaper', summary: parts.join(' '), badge: 'Diaper', badgeVariant: 'secondary' }
}

function pumpSummary(p: PumpRow): HistoryItem {
  const parts = [`${p.volume_ml} ml ${p.output_type.replace('_', ' ')}`]
  if (p.side) parts.push(`· ${p.side}`)
  if (p.duration_min) parts.push(`· ${p.duration_min} min`)
  return { at: p.start_at, type: 'pump', summary: parts.join(' '), badge: 'Pump', badgeVariant: 'outline' }
}

function sleepSummary(s: SleepRow): HistoryItem {
  const dur = s.end_at
    ? `${((new Date(s.end_at).getTime() - new Date(s.start_at).getTime()) / (1000 * 60 * 60)).toFixed(1)} h`
    : 'ongoing'
  return { at: s.start_at, type: 'sleep', summary: `${dur} · ${s.location.replace('_', ' ')}`, badge: 'Sleep', badgeVariant: 'outline' }
}

function weightSummary(w: WeightRow): HistoryItem {
  return { at: w.measured_at, type: 'weight', summary: formatOz(w.weight_oz), badge: 'Weight', badgeVariant: 'secondary' }
}

function pedNoteSummary(n: PedNoteRow): HistoryItem {
  const label = n.type === 'question' ? 'Question' : n.type === 'instruction_received' ? 'Instruction' : 'Observation'
  return { at: n.occurred_at, type: 'ped_note', summary: n.content, badge: label, badgeVariant: 'outline' }
}

export default function HistoryPage() {
  const supabase = createClient()
  const { baby, loading: babyLoading } = useBaby()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [fetching, setFetching] = useState(false)
  const [limit] = useState(100)

  const fetchData = useCallback(async () => {
    if (!baby) return
    setFetching(true)

    const { data: fData } = await supabase.from('feeds').select('*').eq('baby_id', baby.id).order('start_at', { ascending: false }).limit(limit)
    const { data: dData } = await supabase.from('diapers').select('*').eq('baby_id', baby.id).order('changed_at', { ascending: false }).limit(limit)
    const { data: pData } = await supabase.from('pumps').select('*').eq('baby_id', baby.id).order('start_at', { ascending: false }).limit(limit)
    const { data: sData } = await supabase.from('sleeps').select('*').eq('baby_id', baby.id).order('start_at', { ascending: false }).limit(limit)
    const { data: wData } = await supabase.from('weights').select('*').eq('baby_id', baby.id).order('measured_at', { ascending: false }).limit(limit)
    const { data: nData } = await supabase.from('pediatrician_notes').select('*').eq('baby_id', baby.id).order('occurred_at', { ascending: false }).limit(limit)

    const all: HistoryItem[] = [
      ...((fData as FeedRow[]) ?? []).map(feedSummary),
      ...((dData as DiaperRow[]) ?? []).map(diaperSummary),
      ...((pData as PumpRow[]) ?? []).map(pumpSummary),
      ...((sData as SleepRow[]) ?? []).map(sleepSummary),
      ...((wData as WeightRow[]) ?? []).map(weightSummary),
      ...((nData as PedNoteRow[]) ?? []).map(pedNoteSummary),
    ]

    all.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    setItems(all)
    setFetching(false)
  }, [baby, supabase, limit])

  useEffect(() => {
    if (!babyLoading && baby) fetchData()
  }, [babyLoading, baby, fetchData])

  if (babyLoading) {
    return (
      <div className="p-4 pt-6 space-y-3">
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
      </div>
    )
  }

  if (!baby) return <div className="p-4 pt-6"><p className="text-muted-foreground">No baby profile found.</p></div>

  return (
    <div className="p-4 pt-6 pb-24 space-y-4">
      <h1 className="text-xl font-bold">History</h1>

      {fetching ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No events logged yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
              <Badge variant={item.badgeVariant ?? 'default'} className="shrink-0 mt-0.5 text-xs">
                {item.badge}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">{item.summary}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatLocalDateTime(item.at)}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2 text-center">
            Showing most recent {limit} events of each type
          </p>
        </div>
      )}
    </div>
  )
}
