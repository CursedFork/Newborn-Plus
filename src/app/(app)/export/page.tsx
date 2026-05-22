'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBaby } from '@/contexts/BabyContext'
import ExportReport from '@/components/export/ExportReport'
import ShareLinkManager from '@/components/export/ShareLinkManager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type {
  FeedRow, DiaperRow, PumpRow, SleepRow, WeightRow,
  PedNoteRow, PedNoteLinkRow, DailyRollupRow,
} from '@/lib/database.types'

type Preset = 'all' | '7d' | '14d' | '30d' | 'custom'

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function presetRange(preset: Preset): { start: string; end: string } {
  const today = new Date()
  const end = toIso(today)
  if (preset === '7d') return { start: toIso(new Date(Date.now() - 6 * 86400000)), end }
  if (preset === '14d') return { start: toIso(new Date(Date.now() - 13 * 86400000)), end }
  if (preset === '30d') return { start: toIso(new Date(Date.now() - 29 * 86400000)), end }
  return { start: '', end: '' } // 'all' and 'custom' handled separately
}

export default function ExportPage() {
  const supabase = createClient()
  const { baby, caregiver, loading: babyLoading } = useBaby()

  const [preset, setPreset] = useState<Preset>('all')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [dataStart, setDataStart] = useState('')
  const [dataEnd, setDataEnd] = useState('')

  const [fetching, setFetching] = useState(false)
  const [rollup, setRollup] = useState<DailyRollupRow[]>([])
  const [feeds, setFeeds] = useState<FeedRow[]>([])
  const [diapers, setDiapers] = useState<DiaperRow[]>([])
  const [pumps, setPumps] = useState<PumpRow[]>([])
  const [sleeps, setSleeps] = useState<SleepRow[]>([])
  const [weights, setWeights] = useState<WeightRow[]>([])
  const [pedNotes, setPedNotes] = useState<PedNoteRow[]>([])
  const [pedNoteLinks, setPedNoteLinks] = useState<PedNoteLinkRow[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  // Resolve actual date range to use in queries
  function getQueryRange(): { gte: string; lte: string } | null {
    if (preset === 'all') return null // no filter
    if (preset === 'custom') {
      if (!customStart || !customEnd) return null
      return { gte: customStart, lte: customEnd }
    }
    const { start, end } = presetRange(preset)
    return { gte: start, lte: end }
  }

  const fetchData = useCallback(async () => {
    if (!baby) return
    setFetching(true)
    const range = getQueryRange()

    const { data: user } = await supabase.auth.getUser()
    setUserId(user.user?.id ?? null)

    // Rollup
    let rollupQ = supabase.from('daily_rollup').select('*').eq('baby_id', baby.id).order('day')
    if (range) rollupQ = rollupQ.gte('day', range.gte).lte('day', range.lte)
    const { data: rData } = await rollupQ
    setRollup((rData as DailyRollupRow[]) ?? [])

    // Feeds
    let feedQ = supabase.from('feeds').select('*').eq('baby_id', baby.id).order('start_at')
    if (range) feedQ = feedQ.gte('start_at', range.gte).lte('start_at', range.lte + 'T23:59:59Z')
    const { data: fData } = await feedQ
    setFeeds((fData as FeedRow[]) ?? [])

    // Diapers
    let diaQ = supabase.from('diapers').select('*').eq('baby_id', baby.id).order('changed_at')
    if (range) diaQ = diaQ.gte('changed_at', range.gte).lte('changed_at', range.lte + 'T23:59:59Z')
    const { data: dData } = await diaQ
    setDiapers((dData as DiaperRow[]) ?? [])

    // Pumps
    let pumpQ = supabase.from('pumps').select('*').eq('baby_id', baby.id).order('start_at')
    if (range) pumpQ = pumpQ.gte('start_at', range.gte).lte('start_at', range.lte + 'T23:59:59Z')
    const { data: pData } = await pumpQ
    setPumps((pData as PumpRow[]) ?? [])

    // Sleeps
    let sleepQ = supabase.from('sleeps').select('*').eq('baby_id', baby.id).order('start_at')
    if (range) sleepQ = sleepQ.gte('start_at', range.gte).lte('start_at', range.lte + 'T23:59:59Z')
    const { data: sData } = await sleepQ
    setSleeps((sData as SleepRow[]) ?? [])

    // Weights
    let wQ = supabase.from('weights').select('*').eq('baby_id', baby.id).order('measured_at')
    if (range) wQ = wQ.gte('measured_at', range.gte).lte('measured_at', range.lte + 'T23:59:59Z')
    const { data: wData } = await wQ
    setWeights((wData as WeightRow[]) ?? [])

    // Ped notes (always load all — notes may reference events outside range)
    const { data: nData } = await supabase.from('pediatrician_notes').select('*').eq('baby_id', baby.id).order('occurred_at')
    setPedNotes((nData as PedNoteRow[]) ?? [])

    // Note links
    if (nData && nData.length > 0) {
      const noteIds = (nData as PedNoteRow[]).map((n) => n.id)
      const { data: lData } = await supabase.from('pediatrician_note_links').select('*').in('note_id', noteIds)
      setPedNoteLinks((lData as PedNoteLinkRow[]) ?? [])
    } else {
      setPedNoteLinks([])
    }

    // Compute display dates
    if (range) {
      setDataStart(range.gte)
      setDataEnd(range.lte)
    } else if (rData && rData.length > 0) {
      const rows = rData as DailyRollupRow[]
      setDataStart(rows[0].day)
      setDataEnd(rows[rows.length - 1].day)
    } else {
      setDataStart(''); setDataEnd('')
    }

    setFetching(false)
  }, [baby, preset, customStart, customEnd, supabase])

  useEffect(() => {
    if (!babyLoading && baby) fetchData()
  }, [babyLoading, baby, fetchData])

  if (babyLoading) {
    return (
      <div className="p-4 pt-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (!baby || !caregiver) {
    return (
      <div className="p-4 pt-6">
        <p className="text-muted-foreground">No baby profile found. Set one up in Settings.</p>
      </div>
    )
  }

  const PRESETS: { value: Preset; label: string }[] = [
    { value: 'all', label: 'All data' },
    { value: '7d', label: 'Last 7 days' },
    { value: '14d', label: 'Last 14 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: 'custom', label: 'Custom' },
  ]

  return (
    <div className="p-4 pt-6 pb-24 max-w-4xl space-y-6 print:p-0 print:pt-0">
      {/* Controls — hidden when printing */}
      <div className="print:hidden space-y-4">
        <h1 className="text-xl font-bold">Pediatrician export</h1>

        <div className="space-y-3">
          <Label>Date range</Label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.value}
                variant={preset === p.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreset(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          {preset === 'custom' && (
            <div className="flex gap-3 items-end flex-wrap">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-40" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-40" />
              </div>
              <Button size="sm" onClick={fetchData} disabled={!customStart || !customEnd}>Apply</Button>
            </div>
          )}
        </div>

        <Separator />

        <ShareLinkManager babyId={baby.id} userId={userId ?? ''} role={caregiver.role} />

        <Separator />
      </div>

      {/* Report */}
      {fetching ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : dataStart ? (
        <ExportReport
          baby={baby}
          caregiver={caregiver}
          rollup={rollup}
          feeds={feeds}
          diapers={diapers}
          pumps={pumps}
          sleeps={sleeps}
          weights={weights}
          pedNotes={pedNotes}
          pedNoteLinks={pedNoteLinks}
          dateStart={dataStart}
          dateEnd={dataEnd}
        />
      ) : (
        <p className="text-muted-foreground text-sm">No data found for the selected range.</p>
      )}
    </div>
  )
}
