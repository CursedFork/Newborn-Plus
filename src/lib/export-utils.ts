import type { FeedRow, DiaperRow, RashStatus } from '@/lib/database.types'

export type FlaggedEventType =
  | 'refused_feed'
  | 'spit_up'
  | 'rash_flare'
  | 'long_gap'
  | 'poop_color_change'
  | 'poop_consistency_change'

export interface FlaggedEvent {
  type: FlaggedEventType
  at: string
  description: string
  relatedId?: string
}

const RASH_SEVERITY: Record<RashStatus, number> = {
  none: 0,
  resolved: 0,
  improving: 1,
  mild: 2,
  moderate: 3,
  severe: 4,
}

export function computeFlaggedEvents(
  feeds: FeedRow[],
  diapers: DiaperRow[],
  longGapHours = 5
): FlaggedEvent[] {
  const events: FlaggedEvent[] = []

  const feedsSorted = [...feeds].sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  )

  // Refused feeds
  for (const f of feedsSorted) {
    if (f.volume_offered_ml && f.volume_ml < f.volume_offered_ml * 0.5) {
      const pct = Math.round((f.volume_ml / f.volume_offered_ml) * 100)
      events.push({
        type: 'refused_feed',
        at: f.start_at,
        description: `Refused feed — took ${f.volume_ml} ml of ${f.volume_offered_ml} ml offered (${pct}%)`,
        relatedId: f.id,
      })
    }
  }

  // Spit-ups
  for (const f of feedsSorted) {
    if (f.spit_up) {
      events.push({
        type: 'spit_up',
        at: f.start_at,
        description: `Spit-up noted${f.spit_up_notes ? ': ' + f.spit_up_notes : ''}`,
        relatedId: f.id,
      })
    }
  }

  // Long gaps between feeds
  for (let i = 1; i < feedsSorted.length; i++) {
    const gapMs =
      new Date(feedsSorted[i].start_at).getTime() -
      new Date(feedsSorted[i - 1].start_at).getTime()
    const gapHrs = gapMs / (1000 * 60 * 60)
    if (gapHrs > longGapHours) {
      events.push({
        type: 'long_gap',
        at: feedsSorted[i].start_at,
        description: `${gapHrs.toFixed(1)} h gap between feeds (threshold: >${longGapHours} h)`,
      })
    }
  }

  // Rash flare-ups and poop changes
  const diapersSorted = [...diapers].sort(
    (a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
  )

  for (let i = 1; i < diapersSorted.length; i++) {
    const prev = diapersSorted[i - 1]
    const curr = diapersSorted[i]

    const prevSev = RASH_SEVERITY[prev.rash_status ?? 'none'] ?? 0
    const currSev = RASH_SEVERITY[curr.rash_status ?? 'none'] ?? 0
    if (currSev > prevSev && currSev >= 2) {
      events.push({
        type: 'rash_flare',
        at: curr.changed_at,
        description: `Rash worsened: ${prev.rash_status ?? 'none'} → ${curr.rash_status}`,
        relatedId: curr.id,
      })
    }
  }

  const poopDiapers = diapersSorted.filter((d) => d.poop)
  for (let i = 1; i < poopDiapers.length; i++) {
    const prev = poopDiapers[i - 1]
    const curr = poopDiapers[i]
    if (curr.poop_color && prev.poop_color && curr.poop_color !== prev.poop_color) {
      events.push({
        type: 'poop_color_change',
        at: curr.changed_at,
        description: `Poop color changed: ${prev.poop_color.replace('_', ' ')} → ${curr.poop_color.replace('_', ' ')}`,
        relatedId: curr.id,
      })
    }
    if (
      curr.poop_consistency &&
      prev.poop_consistency &&
      curr.poop_consistency !== prev.poop_consistency
    ) {
      events.push({
        type: 'poop_consistency_change',
        at: curr.changed_at,
        description: `Poop consistency changed: ${prev.poop_consistency} → ${curr.poop_consistency}`,
        relatedId: curr.id,
      })
    }
  }

  return events.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  )
}

export function formatLocalDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatLocalDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function ageInDays(birthDate: string, at: Date = new Date()): number {
  return Math.floor(
    (at.getTime() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24)
  )
}
