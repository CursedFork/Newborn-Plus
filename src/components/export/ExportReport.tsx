'use client'

import { useRef } from 'react'
import type {
  BabyRow, FeedRow, DiaperRow, PumpRow, SleepRow, WeightRow,
  PedNoteRow, PedNoteLinkRow, DailyRollupRow, CaregiverRow,
} from '@/lib/database.types'
import { computeFlaggedEvents, ageInDays } from '@/lib/export-utils'
import { formatOz } from '@/lib/who/percentiles'
import RollupTable from './RollupTable'
import FlaggedEvents from './FlaggedEvents'
import PedNotesSection from './PedNotesSection'
import ExportCharts from './ExportCharts'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Printer, Download } from 'lucide-react'

interface Props {
  baby: BabyRow
  caregiver?: CaregiverRow | null
  rollup: DailyRollupRow[]
  feeds: FeedRow[]
  diapers: DiaperRow[]
  pumps: PumpRow[]
  sleeps: SleepRow[]
  weights: WeightRow[]
  pedNotes: PedNoteRow[]
  pedNoteLinks: PedNoteLinkRow[]
  dateStart: string
  dateEnd: string
  /** When true, hides the action toolbar (used in public share view) */
  readOnly?: boolean
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 print:break-inside-avoid-page">
      <h2 className="text-lg font-bold border-b border-border pb-2">{title}</h2>
      {children}
    </section>
  )
}

export default function ExportReport({
  baby, rollup, feeds, diapers, pumps, sleeps, weights, pedNotes, pedNoteLinks,
  dateStart, dateEnd, readOnly,
}: Props) {
  const reportRef = useRef<HTMLDivElement>(null)

  const generatedAt = new Date().toLocaleString()
  const ageDays = ageInDays(baby.birth_date)
  const flaggedEvents = computeFlaggedEvents(feeds, diapers)

  function handlePrint() {
    window.print()
  }

  function handleJsonDownload() {
    const payload = {
      generatedAt,
      baby: { name: baby.name, birthDate: baby.birth_date, sex: baby.sex, birthWeightOz: baby.birth_weight_oz },
      dateRange: { start: dateStart, end: dateEnd },
      rollup,
      feeds,
      diapers,
      pumps,
      sleeps,
      weights,
      pediatricianNotes: pedNotes,
      flaggedEvents,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${baby.name.replace(/\s+/g, '-')}-report-${dateStart}-to-${dateEnd}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Toolbar — hidden in print, hidden in read-only mode */}
      {!readOnly && (
        <div className="flex gap-2 mb-6 print:hidden">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
          <Button variant="outline" onClick={handleJsonDownload} className="gap-2">
            <Download className="h-4 w-4" /> Download JSON
          </Button>
        </div>
      )}

      {/* Report content */}
      <div ref={reportRef} className="space-y-8 max-w-4xl print:max-w-none">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{baby.name}</h1>
          <div className="text-sm text-muted-foreground space-y-0.5">
            <p>Date of birth: {new Date(baby.birth_date + 'T12:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Age: {ageDays} day{ageDays !== 1 ? 's' : ''}</p>
            {baby.birth_weight_oz != null && <p>Birth weight: {formatOz(baby.birth_weight_oz)}</p>}
            <p>Report period: {new Date(dateStart + 'T12:00:00Z').toLocaleDateString()} – {new Date(dateEnd + 'T12:00:00Z').toLocaleDateString()}</p>
            <p>Generated: {generatedAt}</p>
          </div>
        </div>

        <Separator />

        {/* Per-day rollup */}
        <Section title="Daily summary">
          <RollupTable rows={rollup} />
        </Section>

        {/* Trends */}
        {(feeds.length > 0 || weights.length > 0 || pumps.length > 0) && (
          <Section title="Trends">
            <ExportCharts
              rollup={rollup}
              feeds={feeds}
              pumps={pumps}
              weights={weights}
              babyBirthDate={baby.birth_date}
              babySex={baby.sex}
            />
          </Section>
        )}

        {/* Flagged events */}
        <Section title="Flagged events">
          <FlaggedEvents events={flaggedEvents} />
        </Section>

        {/* Pediatrician notes */}
        <Section title="Pediatrician notes">
          <PedNotesSection
            notes={pedNotes}
            links={pedNoteLinks}
            feeds={feeds}
            diapers={diapers}
            pumps={pumps}
            sleeps={sleeps}
            weights={weights}
          />
        </Section>
      </div>
    </div>
  )
}
