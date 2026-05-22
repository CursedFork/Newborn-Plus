import { createAdminClient } from '@/lib/supabase/admin'
import ExportReport from '@/components/export/ExportReport'
import type {
  BabyRow, FeedRow, DiaperRow, PumpRow, SleepRow, WeightRow,
  PedNoteRow, PedNoteLinkRow, DailyRollupRow,
} from '@/lib/database.types'

interface Props {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: Props) {
  const { token } = await params
  const supabase = createAdminClient()

  // Validate token and get baby_id + optional date range
  const { data: resolved, error: resolveError } = await supabase
    .rpc('resolve_share_link', { p_token: token })

  if (resolveError || !resolved || resolved.length === 0) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Link not found</h1>
          <p className="text-muted-foreground text-sm">
            This link may have expired or been revoked.
          </p>
        </div>
      </main>
    )
  }

  const { baby_id, date_range_start, date_range_end } = resolved[0]

  // Fetch baby info
  const { data: baby } = await supabase.from('babies').select('*').eq('id', baby_id).single()
  if (!baby) return <main className="p-8 text-center"><p className="text-muted-foreground">Baby not found.</p></main>

  const dateStart = date_range_start ?? null
  const dateEnd = date_range_end ?? null

  async function fetchRange<T>(table: string, dateCol: string): Promise<T[]> {
    let q = supabase.from(table).select('*').eq('baby_id', baby_id).order(dateCol)
    if (dateStart) q = q.gte(dateCol, dateStart)
    if (dateEnd) q = q.lte(dateCol, dateEnd + 'T23:59:59Z')
    const { data } = await q
    return (data as T[]) ?? []
  }

  const [feeds, diapers, pumps, sleeps, weights, pedNotes] = await Promise.all([
    fetchRange<FeedRow>('feeds', 'start_at'),
    fetchRange<DiaperRow>('diapers', 'changed_at'),
    fetchRange<PumpRow>('pumps', 'start_at'),
    fetchRange<SleepRow>('sleeps', 'start_at'),
    fetchRange<WeightRow>('weights', 'measured_at'),
    fetchRange<PedNoteRow>('pediatrician_notes', 'occurred_at'),
  ])

  let rollupQ = supabase.from('daily_rollup').select('*').eq('baby_id', baby_id).order('day')
  if (dateStart) rollupQ = rollupQ.gte('day', dateStart)
  if (dateEnd) rollupQ = rollupQ.lte('day', dateEnd)
  const { data: rollupData } = await rollupQ
  const rollup = (rollupData as DailyRollupRow[]) ?? []

  let pedNoteLinks: PedNoteLinkRow[] = []
  if (pedNotes.length > 0) {
    const { data: lData } = await supabase
      .from('pediatrician_note_links')
      .select('*')
      .in('note_id', pedNotes.map((n) => n.id))
    pedNoteLinks = (lData as PedNoteLinkRow[]) ?? []
  }

  // Record view (best-effort — view_count increment requires an RPC not yet in schema)
  supabase
    .from('share_links')
    .update({ last_viewed_at: new Date().toISOString() })
    .eq('token', token)
    .then(() => {})

  const displayStart = dateStart ?? (rollup[0]?.day ?? new Date().toISOString().slice(0, 10))
  const displayEnd = dateEnd ?? (rollup[rollup.length - 1]?.day ?? displayStart)

  return (
    <main className="min-h-dvh bg-background">
      <div className="max-w-4xl mx-auto p-4 pt-6 pb-16 space-y-4">
        <div className="print:hidden">
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
            Read-only report shared by {(baby as BabyRow).name}&apos;s caregivers · Your pediatrician can help interpret this data
          </p>
        </div>
        <ExportReport
          baby={baby as BabyRow}
          rollup={rollup}
          feeds={feeds}
          diapers={diapers}
          pumps={pumps}
          sleeps={sleeps}
          weights={weights}
          pedNotes={pedNotes}
          pedNoteLinks={pedNoteLinks}
          dateStart={displayStart}
          dateEnd={displayEnd}
          readOnly
        />
      </div>
    </main>
  )
}
