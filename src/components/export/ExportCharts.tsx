'use client'

import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { DailyRollupRow, FeedRow, PumpRow, WeightRow } from '@/lib/database.types'
import { getPercentileTable, kgToOz, formatOz } from '@/lib/who/percentiles'
import type { BabySex } from '@/lib/database.types'

interface Props {
  rollup: DailyRollupRow[]
  feeds: FeedRow[]
  pumps: PumpRow[]
  weights: WeightRow[]
  babyBirthDate: string
  babySex: BabySex
}

function dayLabel(utcDate: string) {
  return new Date(utcDate + 'T12:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function ChartSection({ title, tooltip, children }: { title: string; tooltip: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground mt-0.5 leading-snug">— {tooltip}</span>
      </div>
      {children}
    </div>
  )
}

export default function ExportCharts({ rollup, feeds, pumps, weights, babyBirthDate, babySex }: Props) {
  // ── Intake by type (stacked bar) ──────────────────────────────────────────
  const intakeData = rollup.map((r) => ({
    day: dayLabel(r.day),
    Formula: Math.round(r.formula_ml),
    'Breast milk': Math.round(r.breast_milk_ml),
    Colostrum: Math.round(r.colostrum_ml),
  }))

  // ── Feed volumes scatter ───────────────────────────────────────────────────
  const feedScatterByType = {
    formula: feeds.filter((f) => f.type === 'formula').map((f) => ({
      x: new Date(f.start_at).getTime(),
      y: f.volume_ml,
    })),
    breast_milk: feeds.filter((f) => f.type === 'breast_milk').map((f) => ({
      x: new Date(f.start_at).getTime(),
      y: f.volume_ml,
    })),
    colostrum: feeds.filter((f) => f.type === 'colostrum').map((f) => ({
      x: new Date(f.start_at).getTime(),
      y: f.volume_ml,
    })),
  }

  // ── Feed intervals scatter ─────────────────────────────────────────────────
  const feedsSorted = [...feeds].sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  )
  const intervalData = feedsSorted.slice(1).map((f, i) => ({
    x: new Date(f.start_at).getTime(),
    y: +(
      (new Date(f.start_at).getTime() - new Date(feedsSorted[i].start_at).getTime()) /
      (1000 * 60 * 60)
    ).toFixed(2),
  }))

  // ── Pump output line ───────────────────────────────────────────────────────
  const pumpData = [...pumps]
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    .map((p) => ({
      x: new Date(p.start_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric' }),
      y: p.volume_ml,
      type: p.output_type.replace('_', ' '),
    }))

  // ── Diaper bar ─────────────────────────────────────────────────────────────
  const diaperBar = rollup.map((r) => ({
    day: dayLabel(r.day),
    Pees: Number(r.pee_count),
    Poops: Number(r.poop_count),
  }))

  // ── Weight curve with WHO percentiles ─────────────────────────────────────
  const birthMs = new Date(babyBirthDate).getTime()
  const percentileTable = getPercentileTable(babySex)

  const weightChartData: Array<{
    ageDays: number
    p3oz?: number
    p50oz?: number
    p97oz?: number
    weightOz?: number
  }> = []

  const ageDaySet = new Set<number>()
  percentileTable.forEach((r) => ageDaySet.add(r.week * 7))
  weights.forEach((w) => ageDaySet.add(Math.floor((new Date(w.measured_at).getTime() - birthMs) / (1000 * 60 * 60 * 24))))

  ;[...ageDaySet].sort((a, b) => a - b).forEach((ageDays) => {
    const week = Math.round(ageDays / 7)
    const pRow = percentileTable[Math.min(week, percentileTable.length - 1)]
    const wRow = weights.find(
      (w) => Math.floor((new Date(w.measured_at).getTime() - birthMs) / (1000 * 60 * 60 * 24)) === ageDays
    )
    weightChartData.push({
      ageDays,
      p3oz: kgToOz(pRow.p3),
      p50oz: kgToOz(pRow.p50),
      p97oz: kgToOz(pRow.p97),
      weightOz: wRow?.weight_oz,
    })
  })

  const tsTickFormatter = (v: number) =>
    new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const tsTipFormatter = (v: number) =>
    new Date(v).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

  return (
    <div className="space-y-10 print:space-y-8">
      {/* Intake stacked bar */}
      {intakeData.length > 0 && (
        <ChartSection
          title="Daily intake by type"
          tooltip="Stacked total ml consumed per day. Your pediatrician can help interpret normal ranges."
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={intakeData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis unit=" ml" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Formula" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Breast milk" stackId="a" fill="#ec4899" />
              <Bar dataKey="Colostrum" stackId="a" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* Feed volumes scatter */}
      {feeds.length > 0 && (
        <ChartSection
          title="Feed volumes over time"
          tooltip="Each dot is one feed, colored by type. Downward trends may reflect cluster feeding."
        >
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="x" type="number" domain={['auto', 'auto']} tickFormatter={tsTickFormatter} tick={{ fontSize: 11 }} />
              <YAxis dataKey="y" unit=" ml" tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={() => ''} formatter={(v, n, p) => [`${p.payload.y} ml`, tsTipFormatter(p.payload.x)]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {feedScatterByType.formula.length > 0 && <Scatter name="Formula" data={feedScatterByType.formula} fill="#3b82f6" />}
              {feedScatterByType.breast_milk.length > 0 && <Scatter name="Breast milk" data={feedScatterByType.breast_milk} fill="#ec4899" />}
              {feedScatterByType.colostrum.length > 0 && <Scatter name="Colostrum" data={feedScatterByType.colostrum} fill="#f59e0b" />}
            </ScatterChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* Feed intervals scatter */}
      {intervalData.length > 0 && (
        <ChartSection
          title="Feed intervals"
          tooltip="Hours between consecutive feed starts. Newborns typically feed every 2–3 h. Consult your pediatrician for guidance."
        >
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="x" type="number" domain={['auto', 'auto']} tickFormatter={tsTickFormatter} tick={{ fontSize: 11 }} />
              <YAxis dataKey="y" unit=" h" tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={() => ''} formatter={(v, n, p) => [`${p.payload.y} h`, tsTipFormatter(p.payload.x)]} />
              <Scatter name="Gap" data={intervalData} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* Pump output */}
      {pumpData.length > 0 && (
        <ChartSection
          title="Pump output over time"
          tooltip="Volume pumped per session. Transitional milk typically increases in volume over the first 2 weeks."
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pumpData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="x" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis unit=" ml" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line dataKey="y" name="Volume (ml)" stroke="#10b981" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* Diaper frequency */}
      {diaperBar.length > 0 && (
        <ChartSection
          title="Diaper frequency"
          tooltip="Pees and poops per day. Adequate wet diapers indicate sufficient hydration."
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={diaperBar} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Pees" fill="#60a5fa" />
              <Bar dataKey="Poops" fill="#a78bfa" />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* Weight curve with WHO percentiles */}
      {weights.length > 0 && (
        <ChartSection
          title="Weight curve"
          tooltip={`WHO ${babySex === 'female' ? 'girls' : 'boys'} reference lines (P3 / P50 / P97). Dashed lines = WHO standards; solid line = actual measurements. Always discuss weight trends with your pediatrician.`}
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weightChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="ageDays" unit=" d" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatOz(v)}
                width={70}
              />
              <Tooltip
                formatter={(v, name) => {
                  const oz = Number(v)
                  return name === 'Actual weight' ? [formatOz(oz), name] : [`${formatOz(oz)} (WHO)`, name]
                }}
                labelFormatter={(v) => `Day ${v}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line dataKey="p3oz" name="P3 (WHO)" stroke="#94a3b8" strokeDasharray="4 4" dot={false} connectNulls />
              <Line dataKey="p50oz" name="P50 (WHO)" stroke="#64748b" strokeDasharray="6 2" dot={false} connectNulls />
              <Line dataKey="p97oz" name="P97 (WHO)" stroke="#94a3b8" strokeDasharray="4 4" dot={false} connectNulls />
              <Line dataKey="weightOz" name="Actual weight" stroke="#ef4444" strokeWidth={2} dot={{ r: 5 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground">
            WHO Child Growth Standards (2006) — your pediatrician can help interpret this curve.
          </p>
        </ChartSection>
      )}
    </div>
  )
}
