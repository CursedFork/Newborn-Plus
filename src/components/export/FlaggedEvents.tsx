'use client'

import type { FlaggedEvent } from '@/lib/export-utils'
import { formatLocalDateTime } from '@/lib/export-utils'
import { Badge } from '@/components/ui/badge'

interface Props {
  events: FlaggedEvent[]
}

const LABELS: Record<FlaggedEvent['type'], { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  refused_feed:           { label: 'Refused feed',       variant: 'destructive' },
  spit_up:                { label: 'Spit-up',            variant: 'secondary' },
  rash_flare:             { label: 'Rash flare',         variant: 'destructive' },
  long_gap:               { label: 'Long gap',           variant: 'outline' },
  poop_color_change:      { label: 'Poop color',         variant: 'secondary' },
  poop_consistency_change:{ label: 'Poop consistency',   variant: 'secondary' },
}

export default function FlaggedEvents({ events }: Props) {
  if (events.length === 0) {
    return <p className="text-muted-foreground text-sm">No flagged events in this period.</p>
  }

  return (
    <div className="space-y-2">
      {events.map((ev, i) => {
        const meta = LABELS[ev.type]
        return (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
            <Badge variant={meta.variant} className="shrink-0 mt-0.5">{meta.label}</Badge>
            <div className="min-w-0">
              <p className="text-sm leading-snug">{ev.description}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatLocalDateTime(ev.at)}</p>
            </div>
          </div>
        )
      })}
      <p className="text-xs text-muted-foreground pt-2">
        Your pediatrician can help interpret these observations — always consult them for medical guidance.
      </p>
    </div>
  )
}
