'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBaby } from '@/contexts/BabyContext'
import { formatLocalDateTime } from '@/lib/export-utils'
import { formatOz } from '@/lib/who/percentiles'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAppearance } from '@/contexts/AppearanceContext'
import { formatVolume } from '@/lib/units'
import type { VolumeUnit } from '@/lib/units'
import FeedModal from '@/components/log/FeedModal'
import DiaperModal from '@/components/log/DiaperModal'
import SleepModal from '@/components/log/SleepModal'
import PumpModal from '@/components/log/PumpModal'
import WeightModal from '@/components/log/WeightModal'
import PedNoteModal from '@/components/log/PedNoteModal'
import type { FeedRow, DiaperRow, PumpRow, SleepRow, WeightRow, PedNoteRow } from '@/lib/database.types'

type AnyRow = FeedRow | DiaperRow | PumpRow | SleepRow | WeightRow | PedNoteRow
type EventType = 'feed' | 'diaper' | 'pump' | 'sleep' | 'weight' | 'ped_note'

const TABLE_FOR_TYPE: Record<EventType, string> = {
  feed: 'feeds',
  diaper: 'diapers',
  pump: 'pumps',
  sleep: 'sleeps',
  weight: 'weights',
  ped_note: 'pediatrician_notes',
}

interface HistoryItem {
  at: string
  id: string
  type: EventType
  rawRow: AnyRow
  summary: string
  badge: string
  badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive'
}

function feedSummary(f: FeedRow): HistoryItem {
  const typeName = f.type === 'breast_milk' ? 'Breast milk' : f.type === 'colostrum' ? 'Colostrum' : 'Formula'
  const parts = [`${f.volume_ml} ml ${typeName}`]
  if (f.formula_brand) parts.push(`(${f.formula_brand})`)
  if (f.spit_up) parts.push('· spit-up')
  if (f.volume_offered_ml && f.volume_ml < f.volume_offered_ml * 0.5) parts.push('· refused')
  return { at: f.start_at, id: f.id, type: 'feed', rawRow: f, summary: parts.join(' '), badge: 'Feed', badgeVariant: 'default' }
}

function diaperSummary(d: DiaperRow): HistoryItem {
  const what = [d.pee && 'pee', d.poop && 'poop'].filter(Boolean).join(' + ')
  const parts = [what]
  if (d.poop_color) parts.push(`· ${d.poop_color.replace('_', ' ')}`)
  if (d.rash_status && d.rash_status !== 'none') parts.push(`· rash: ${d.rash_status}`)
  if (d.cream_applied && d.cream_applied !== 'none') parts.push(`· ${d.cream_applied.replace('_', ' ')}`)
  return { at: d.changed_at, id: d.id, type: 'diaper', rawRow: d, summary: parts.join(' '), badge: 'Diaper', badgeVariant: 'secondary' }
}

function pumpSummary(p: PumpRow): HistoryItem {
  const parts = [`${p.volume_ml} ml ${p.output_type.replace('_', ' ')}`]
  if (p.side) parts.push(`· ${p.side}`)
  if (p.duration_min) parts.push(`· ${p.duration_min} min`)
  return { at: p.start_at, id: p.id, type: 'pump', rawRow: p, summary: parts.join(' '), badge: 'Pump', badgeVariant: 'outline' }
}

function sleepSummary(s: SleepRow): HistoryItem {
  const dur = s.end_at
    ? `${((new Date(s.end_at).getTime() - new Date(s.start_at).getTime()) / (1000 * 60 * 60)).toFixed(1)} h`
    : 'ongoing'
  return { at: s.start_at, id: s.id, type: 'sleep', rawRow: s, summary: `${dur} · ${s.location.replace(/_/g, ' ')}`, badge: 'Sleep', badgeVariant: 'outline' }
}

function weightSummary(w: WeightRow): HistoryItem {
  return { at: w.measured_at, id: w.id, type: 'weight', rawRow: w, summary: formatOz(w.weight_oz), badge: 'Weight', badgeVariant: 'secondary' }
}

function pedNoteSummary(n: PedNoteRow): HistoryItem {
  const label = n.type === 'question' ? 'Question' : n.type === 'instruction_received' ? 'Instruction' : 'Observation'
  return { at: n.occurred_at, id: n.id, type: 'ped_note', rawRow: n, summary: n.content, badge: label, badgeVariant: 'outline' }
}

/** Re-derives the display summary from the raw row, respecting the current unit. */
function getSummary(item: HistoryItem, unit: VolumeUnit): string {
  if (item.type === 'feed') {
    const f = item.rawRow as FeedRow
    const typeName = f.type === 'breast_milk' ? 'Breast milk' : f.type === 'colostrum' ? 'Colostrum' : 'Formula'
    const parts = [`${formatVolume(f.volume_ml, unit)} ${typeName}`]
    if (f.formula_brand) parts.push(`(${f.formula_brand})`)
    if (f.spit_up) parts.push('· spit-up')
    if (f.volume_offered_ml && f.volume_ml < f.volume_offered_ml * 0.5) parts.push('· refused')
    return parts.join(' ')
  }
  if (item.type === 'pump') {
    const p = item.rawRow as PumpRow
    const parts = [`${formatVolume(p.volume_ml, unit)} ${p.output_type.replace('_', ' ')}`]
    if (p.side) parts.push(`· ${p.side}`)
    if (p.duration_min) parts.push(`· ${p.duration_min} min`)
    return parts.join(' ')
  }
  return item.summary
}

export default function HistoryPage() {
  const supabase = createClient()
  const { baby, loading: babyLoading } = useBaby()
  const { volumeUnit } = useAppearance()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [fetching, setFetching] = useState(false)
  const [editTarget, setEditTarget] = useState<HistoryItem | null>(null)
  const [limit] = useState(100)

  const fetchData = useCallback(async () => {
    if (!baby) return
    setFetching(true)

    const [fRes, dRes, pRes, sRes, wRes, nRes] = await Promise.all([
      supabase.from('feeds').select('*').eq('baby_id', baby.id).order('start_at', { ascending: false }).limit(limit),
      supabase.from('diapers').select('*').eq('baby_id', baby.id).order('changed_at', { ascending: false }).limit(limit),
      supabase.from('pumps').select('*').eq('baby_id', baby.id).order('start_at', { ascending: false }).limit(limit),
      supabase.from('sleeps').select('*').eq('baby_id', baby.id).order('start_at', { ascending: false }).limit(limit),
      supabase.from('weights').select('*').eq('baby_id', baby.id).order('measured_at', { ascending: false }).limit(limit),
      supabase.from('pediatrician_notes').select('*').eq('baby_id', baby.id).order('occurred_at', { ascending: false }).limit(limit),
    ])

    const all: HistoryItem[] = [
      ...((fRes.data as FeedRow[]) ?? []).map(feedSummary),
      ...((dRes.data as DiaperRow[]) ?? []).map(diaperSummary),
      ...((pRes.data as PumpRow[]) ?? []).map(pumpSummary),
      ...((sRes.data as SleepRow[]) ?? []).map(sleepSummary),
      ...((wRes.data as WeightRow[]) ?? []).map(weightSummary),
      ...((nRes.data as PedNoteRow[]) ?? []).map(pedNoteSummary),
    ]

    all.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    setItems(all)
    setFetching(false)
  }, [baby, supabase, limit])

  useEffect(() => {
    if (!babyLoading && baby) fetchData()
  }, [babyLoading, baby, fetchData])

  function handleEdit(item: HistoryItem) {
    setEditTarget(item)
  }

  function handleDelete(item: HistoryItem) {
    const table = TABLE_FOR_TYPE[item.type]
    toast(`Delete this ${item.badge.toLowerCase()}?`, {
      action: {
        label: 'Yes, delete',
        onClick: async () => {
          const { error } = await supabase.from(table as never).delete().eq('id', item.id)
          if (error) { toast.error(error.message); return }
          setItems((prev) => prev.filter((i) => !(i.id === item.id && i.type === item.type)))
          toast.success(`${item.badge} deleted`)
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    })
  }

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
          {items.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card"
            >
              <Badge variant={item.badgeVariant} className="shrink-0 mt-0.5 text-xs">
                {item.badge}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">{getSummary(item, volumeUnit)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatLocalDateTime(item.at)}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Options</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => handleDelete(item)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2 text-center">
            Showing most recent {limit} events of each type
          </p>
        </div>
      )}

      {/* Edit modals — rendered with open controlled; Sheet portals are lazy */}
      <FeedModal
        open={editTarget?.type === 'feed'}
        babyId={baby.id}
        initialData={editTarget?.type === 'feed' ? (editTarget.rawRow as FeedRow) : undefined}
        onClose={() => setEditTarget(null)}
        onSaved={() => { setEditTarget(null); fetchData() }}
      />
      <DiaperModal
        open={editTarget?.type === 'diaper'}
        babyId={baby.id}
        initialData={editTarget?.type === 'diaper' ? (editTarget.rawRow as DiaperRow) : undefined}
        onClose={() => setEditTarget(null)}
        onSaved={() => { setEditTarget(null); fetchData() }}
      />
      <SleepModal
        open={editTarget?.type === 'sleep'}
        babyId={baby.id}
        initialData={editTarget?.type === 'sleep' ? (editTarget.rawRow as SleepRow) : undefined}
        onClose={() => setEditTarget(null)}
        onSaved={() => { setEditTarget(null); fetchData() }}
      />
      <PumpModal
        open={editTarget?.type === 'pump'}
        babyId={baby.id}
        initialData={editTarget?.type === 'pump' ? (editTarget.rawRow as PumpRow) : undefined}
        onClose={() => setEditTarget(null)}
        onSaved={() => { setEditTarget(null); fetchData() }}
      />
      <WeightModal
        open={editTarget?.type === 'weight'}
        babyId={baby.id}
        initialData={editTarget?.type === 'weight' ? (editTarget.rawRow as WeightRow) : undefined}
        onClose={() => setEditTarget(null)}
        onSaved={() => { setEditTarget(null); fetchData() }}
      />
      <PedNoteModal
        open={editTarget?.type === 'ped_note'}
        babyId={baby.id}
        initialData={editTarget?.type === 'ped_note' ? (editTarget.rawRow as PedNoteRow) : undefined}
        onClose={() => setEditTarget(null)}
        onSaved={() => { setEditTarget(null); fetchData() }}
      />
    </div>
  )
}
