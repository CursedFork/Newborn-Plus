'use client'

import {
  ComposedChart, BarChart, Bar, LineChart, Line, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { DailyRollupRow, FeedRow, PumpRow, WeightRow } from '@/lib/database.types'
import { getPercentileTable, kgToOz, formatOz } from '@/lib/who/percentiles'
import type { BabySex } from '@/lib/database.types'

// ── Linear regression helpers ──────────────────────────────────────────────

function linearRegression(
  points: { x: number; y: number }[]
): { slope: number; intercept: number } | null {
  const n = points.length
  if (n < 2) return null
  const sumX  = points.reduce((s, p) => s + p.x, 0)
  const sumY  = points.reduce((s, p) => s + p.y, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0)
  const denom = n * sumXX - sumX * sumX
  if (Math.abs(denom) < 1e-10) return null
  return {
    slope:     (n * sumXY - sumX * sumY) / denom,
    intercept: (sumY - sumX * ((n * sumXY - sumX * sumY) / denom)) / n,
  }
}

/** Adds a `trend` field to each element using its array index as x. */
function addIndexTrend<T extends object>(
  arr: T[],
  yGetter: (item: T) => number
): (T & { trend?: number })[] {
  const reg = linearRegression(arr.map((item, i) => ({ x: i, y: yGetter(item) })))
  if (!reg) return arr
  return arr.map((item, i) => ({
    ...item,
    trend: parseFloat((reg.slope * i + reg.intercept).toFixed(2)),
  }))
}

/** Returns two {x, trend} endpoints for a regression over timestamp-keyed scatter data. */
function tsTrendLine(
  data: { x: number; y: number }[]
): { x: number; trend: number }[] {
  if (data.length < 2) return []
  const reg = linearRegression(data)
  if (!reg) return []
  const xs   = data.map((d) => d.x)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  return [
    { x: minX, trend: parseFloat((reg.slope * minX + reg.intercept).toFixed(2)) },
    { x: maxX, trend: parseFloat((reg.slope * maxX + reg.intercept).toFixed(2)) },
  ]
}

const TREND_STROKE = '#94a3b8'
const TREND_DASH   = '5 3'
const trendLineProps = {
  name:         'Trend',
  stroke:       TREND_STROKE,
  strokeDasharray: TREND_DASH,
  dot:          false as const,
  activeDot:    false as const,
  strokeWidth:  1.5,
} as const

// ── Misc helpers ───────────────────────────────────────────────────────────

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

// ── Component ──────────────────────────────────────────────────────────────

export default function ExportCharts({ rollup, feeds, pumps, weights, babyBirthDate, babySex }: Props) {

  // ── 1. Daily intake (stacked bar + total trend) ────────────────────────────
  const intakeRaw = rollup.map((r) => ({
    day:           dayLabel(r.day),
    Formula:       Math.round(r.formula_ml),
    'Breast milk': Math.round(r.breast_milk_ml),
    Colostrum:     Math.round(r.colostrum_ml),
    _total:        Math.round(r.formula_ml + r.breast_milk_ml + r.colostrum_ml),
  }))
  const intakeData = addIndexTrend(intakeRaw, (d) => d._total)

  // ── 2. Feed volumes scatter + trend ───────────────────────────────────────
  const feedScatterByType = {
    formula:     feeds.filter((f) => f.type === 'formula').map((f) => ({ x: new Date(f.start_at).getTime(), y: f.volume_ml })),
    breast_milk: feeds.filter((f) => f.type === 'breast_milk').map((f) => ({ x: new Date(f.start_at).getTime(), y: f.volume_ml })),
    colostrum:   feeds.filter((f) => f.type === 'colostrum').map((f) => ({ x: new Date(f.start_at).getTime(), y: f.volume_ml })),
  }
  const allFeedPoints = [
    ...feedScatterByType.formula,
    ...feedScatterByType.breast_milk,
    ...feedScatterByType.colostrum,
  ].sort((a, b) => a.x - b.x)
  const feedVolumeTrend = tsTrendLine(allFeedPoints)

  // ── 3. Feed intervals scatter + trend ─────────────────────────────────────
  const feedsSorted = [...feeds].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
  const intervalData = feedsSorted.slice(1).map((f, i) => ({
    x: new Date(f.start_at).getTime(),
    y: +((new Date(f.start_at).getTime() - new Date(feedsSorted[i].start_at).getTime()) / (1000 * 60 * 60)).toFixed(2),
  }))
  const intervalTrend = tsTrendLine(intervalData)

  // ── 4. Pump output (line + trend) ─────────────────────────────────────────
  const pumpRaw = [...pumps]
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    .map((p) => ({
      x:    new Date(p.start_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric' }),
      y:    p.volume_ml,
      type: p.output_type.replace('_', ' '),
    }))
  const pumpData = addIndexTrend(pumpRaw, (d) => d.y)

  // ── 5. Diaper frequency (grouped bar + trend) ─────────────────────────────
  const diaperRaw = rollup.map((r) => ({
    day:   dayLabel(r.day),
    Pees:  Number(r.pee_count),
    Poops: Number(r.poop_count),
  }))
  const peeReg   = linearRegression(diaperRaw.map((d, i) => ({ x: i, y: d.Pees })))
  const poopReg  = linearRegression(diaperRaw.map((d, i) => ({ x: i, y: d.Poops })))
  const diaperData = diaperRaw.map((d, i) => ({
    ...d,
    peeTrend:  peeReg  ? parseFloat((peeReg.slope  * i + peeReg.intercept).toFixed(2))  : undefined,
    poopTrend: poopReg ? parseFloat((poopReg.slope * i + poopReg.intercept).toFixed(2)) : undefined,
  }))

  // ── 6. Weight curve with WHO percentiles + trend ───────────────────────────
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
  weights.forEach((w) =>
    ageDaySet.add(Math.floor((new Date(w.measured_at).getTime() - birthMs) / (1000 * 60 * 60 * 24)))
  )

  ;[...ageDaySet].sort((a, b) => a - b).forEach((ageDays) => {
    const week = Math.round(ageDays / 7)
    const pRow = percentileTable[Math.min(week, percentileTable.length - 1)]
    const wRow = weights.find(
      (w) => Math.floor((new Date(w.measured_at).getTime() - birthMs) / (1000 * 60 * 60 * 24)) === ageDays
    )
    weightChartData.push({
      ageDays,
      p3oz:     kgToOz(pRow.p3),
      p50oz:    kgToOz(pRow.p50),
      p97oz:    kgToOz(pRow.p97),
      weightOz: wRow?.weight_oz,
    })
  })

  // Weight trend — computed only over days that have actual measurements
  const actualWeightPoints = weightChartData
    .filter((d) => d.weightOz !== undefined)
    .map((d) => ({ x: d.ageDays, y: d.weightOz! }))
  const weightTrend = tsTrendLine(actualWeightPoints)

  const tsTickFormatter = (v: number) =>
    new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const tsTipFormatter = (v: number) =>
    new Date(v).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

  return (
    <div className="space-y-10 print:space-y-8">

      {/* 1 · Daily intake — stacked bar + trend */}
      {intakeData.length > 0 && (
        <ChartSection
          title="Daily intake by type"
          tooltip="Stacked total ml consumed per day. Dashed line = trend in total daily intake."
        >
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={intakeData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis unit=" ml" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Formula"     stackId="a" fill="#3b82f6" />
              <Bar dataKey="Breast milk" stackId="a" fill="#ec4899" />
              <Bar dataKey="Colostrum"   stackId="a" fill="#f59e0b" />
              <Line dataKey="trend" {...trendLineProps} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* 2 · Feed volumes — scatter + trend */}
      {feeds.length > 0 && (
        <ChartSection
          title="Feed volumes over time"
          tooltip="Each dot is one feed. Dashed line = overall volume trend."
        >
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="x" type="number" domain={['auto', 'auto']} tickFormatter={tsTickFormatter} tick={{ fontSize: 11 }} />
              <YAxis dataKey="y" unit=" ml" tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={() => ''} formatter={(v, n, p) => [`${(p.payload as {y:number}).y} ml`, tsTipFormatter((p.payload as {x:number}).x)]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {feedScatterByType.formula.length     > 0 && <Scatter name="Formula"     data={feedScatterByType.formula}     fill="#3b82f6" />}
              {feedScatterByType.breast_milk.length > 0 && <Scatter name="Breast milk" data={feedScatterByType.breast_milk} fill="#ec4899" />}
              {feedScatterByType.colostrum.length   > 0 && <Scatter name="Colostrum"   data={feedScatterByType.colostrum}   fill="#f59e0b" />}
              {feedVolumeTrend.length > 0 && (
                <Line data={feedVolumeTrend} dataKey="trend" {...trendLineProps} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* 3 · Feed intervals — scatter + trend */}
      {intervalData.length > 0 && (
        <ChartSection
          title="Feed intervals"
          tooltip="Hours between consecutive feed starts. Dashed line = trend. Newborns typically feed every 2–3 h."
        >
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="x" type="number" domain={['auto', 'auto']} tickFormatter={tsTickFormatter} tick={{ fontSize: 11 }} />
              <YAxis dataKey="y" unit=" h" tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={() => ''} formatter={(v, n, p) => [`${(p.payload as {y:number}).y} h`, tsTipFormatter((p.payload as {x:number}).x)]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Scatter name="Gap" data={intervalData} fill="#8b5cf6" />
              {intervalTrend.length > 0 && (
                <Line data={intervalTrend} dataKey="trend" {...trendLineProps} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* 4 · Pump output — line + trend */}
      {pumpData.length > 0 && (
        <ChartSection
          title="Pump output over time"
          tooltip="Volume pumped per session. Dashed line = trend. Milk volume typically increases through the first 2 weeks."
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pumpData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="x" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis unit=" ml" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line dataKey="y"     name="Volume (ml)" stroke="#10b981" dot={{ r: 4 }} />
              <Line dataKey="trend" {...trendLineProps} />
            </LineChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* 5 · Diaper frequency — grouped bar + trend */}
      {diaperData.length > 0 && (
        <ChartSection
          title="Diaper frequency"
          tooltip="Pees and poops per day. Dashed line = trend in total diapers. Adequate wet diapers indicate sufficient hydration."
        >
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={diaperData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Pees"  fill="#60a5fa" />
              <Bar dataKey="Poops" fill="#a78bfa" />
              <Line dataKey="peeTrend"  name="Pee trend"  stroke="#60a5fa" strokeDasharray={TREND_DASH} strokeWidth={1.5} dot={false} activeDot={false} />
              <Line dataKey="poopTrend" name="Poop trend" stroke="#a78bfa" strokeDasharray={TREND_DASH} strokeWidth={1.5} dot={false} activeDot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* 6 · Weight curve — WHO percentiles + actual + trend */}
      {weights.length > 0 && (
        <ChartSection
          title="Weight curve"
          tooltip={`WHO ${babySex === 'female' ? 'girls' : 'boys'} reference lines (P3 / P50 / P97). Dashed slate = weight trend. Always discuss weight trends with your pediatrician.`}
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weightChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="ageDays" unit=" d" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatOz(v)} width={70} />
              <Tooltip
                formatter={(v, name) => {
                  const oz = Number(v)
                  if (name === 'Actual weight') return [formatOz(oz), name]
                  if (name === 'Trend') return [formatOz(oz), name]
                  return [`${formatOz(oz)} (WHO)`, name]
                }}
                labelFormatter={(v) => `Day ${v}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line dataKey="p3oz"     name="P3 (WHO)"      stroke="#94a3b8" strokeDasharray="4 4" dot={false} connectNulls />
              <Line dataKey="p50oz"    name="P50 (WHO)"     stroke="#64748b" strokeDasharray="6 2" dot={false} connectNulls />
              <Line dataKey="p97oz"    name="P97 (WHO)"     stroke="#94a3b8" strokeDasharray="4 4" dot={false} connectNulls />
              <Line dataKey="weightOz" name="Actual weight" stroke="#ef4444" strokeWidth={2} dot={{ r: 5 }} connectNulls={false} />
              {weightTrend.length > 0 && (
                <Line
                  data={weightTrend}
                  dataKey="trend"
                  name="Trend"
                  stroke="#f97316"
                  strokeDasharray={TREND_DASH}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={false}
                />
              )}
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
