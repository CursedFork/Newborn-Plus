'use client'

import type { PedNoteRow, PedNoteLinkRow, FeedRow, DiaperRow, PumpRow, SleepRow, WeightRow } from '@/lib/database.types'
import { formatLocalDateTime } from '@/lib/export-utils'
import { Badge } from '@/components/ui/badge'

interface Props {
  notes: PedNoteRow[]
  links: PedNoteLinkRow[]
  feeds: FeedRow[]
  diapers: DiaperRow[]
  pumps: PumpRow[]
  sleeps: SleepRow[]
  weights: WeightRow[]
}

function resolveLinkedEvent(
  link: PedNoteLinkRow,
  feeds: FeedRow[],
  diapers: DiaperRow[],
  pumps: PumpRow[],
  sleeps: SleepRow[],
  weights: WeightRow[]
): string | null {
  switch (link.event_type) {
    case 'feed': {
      const f = feeds.find((x) => x.id === link.event_id)
      if (!f) return null
      return `Feed: ${f.volume_ml} ml ${f.type} at ${formatLocalDateTime(f.start_at)}${f.volume_offered_ml ? ` (of ${f.volume_offered_ml} ml offered)` : ''}`
    }
    case 'diaper': {
      const d = diapers.find((x) => x.id === link.event_id)
      if (!d) return null
      const what = [d.pee && 'pee', d.poop && 'poop'].filter(Boolean).join(' + ')
      return `Diaper (${what}) at ${formatLocalDateTime(d.changed_at)}`
    }
    case 'pump': {
      const p = pumps.find((x) => x.id === link.event_id)
      if (!p) return null
      return `Pump: ${p.volume_ml} ml ${p.output_type.replace('_', ' ')} at ${formatLocalDateTime(p.start_at)}`
    }
    case 'sleep': {
      const s = sleeps.find((x) => x.id === link.event_id)
      if (!s) return null
      return `Sleep started ${formatLocalDateTime(s.start_at)}${s.end_at ? ` → ${formatLocalDateTime(s.end_at)}` : ' (ongoing)'}`
    }
    case 'weight': {
      const w = weights.find((x) => x.id === link.event_id)
      if (!w) return null
      const lb = Math.floor(w.weight_oz / 16)
      const oz = Math.round(w.weight_oz % 16)
      return `Weight: ${lb} lb ${oz} oz at ${formatLocalDateTime(w.measured_at)}`
    }
    default:
      return null
  }
}

export default function PedNotesSection({ notes, links, feeds, diapers, pumps, sleeps, weights }: Props) {
  const openQuestions = notes.filter((n) => n.type === 'question' && n.status === 'open')
  const instructions = notes.filter((n) => n.type === 'instruction_received').sort(
    (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime()
  )

  return (
    <div className="space-y-8">
      {/* Open questions */}
      <div>
        <h3 className="text-base font-semibold mb-3">Open questions for pediatrician</h3>
        {openQuestions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No open questions.</p>
        ) : (
          <div className="space-y-4">
            {openQuestions.map((note) => {
              const noteLinks = links.filter((l) => l.note_id === note.id)
              return (
                <div key={note.id} className="border border-border rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline">Question</Badge>
                    <p className="text-sm font-medium leading-snug">{note.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Logged {formatLocalDateTime(note.occurred_at)}</p>
                  {noteLinks.length > 0 && (
                    <div className="pt-1 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Linked context:</p>
                      {noteLinks.map((link) => {
                        const desc = resolveLinkedEvent(link, feeds, diapers, pumps, sleeps, weights)
                        return desc ? (
                          <p key={link.id} className="text-xs text-muted-foreground pl-2 border-l-2 border-muted">
                            {desc}
                          </p>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Instructions log */}
      <div>
        <h3 className="text-base font-semibold mb-3">Instructions received</h3>
        {instructions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No instructions logged.</p>
        ) : (
          <div className="space-y-3">
            {instructions.map((note) => (
              <div key={note.id} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
                <Badge variant="secondary" className="shrink-0 mt-0.5">Instruction</Badge>
                <div>
                  <p className="text-sm">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatLocalDateTime(note.occurred_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
