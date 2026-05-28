'use client'

import { useTheme } from 'next-themes'
import {
  ComposedChart, Bar, LineChart, Line, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { DailyRollupRow, FeedRow, PumpRow, SleepRow, WeightRow } from '@/lib/database.types'
import { getPercentileTable, kgToOz, formatOz } from '@/lib/who/percentiles'
import type { BabySex } from '@/lib/database.types'

// ── Linear regression ──────────────────────────────────────────────────────

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
  const slope     = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

/** Adds a numeric `trend` field to every array element (index = x). */
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

/** Two-point regression line for scatter charts with a numeric x-axis. */
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

// ── Theme helpers ──────────────────────────────────────────────────────────

function useChartTheme() {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === 'dark'
  return {
    tickFill:   dark ? '#cbd5e1' : '#374151',   // slate-300 / gray-700
    gridStroke: dark ? '#1e293b' : '#f1f5f9',   // slate-800 / slate-100
    mutedFill:  dark ? '#475569' : '#94a3b8',   // for WHO lines, etc.
  }
}

const TREND_DASH = '5 3'

// ── Misc ───────────────────────────────────────────────────────────────────

interface Props {
  rollup:         DailyRollupRow[]
  feeds:          FeedRow[]
  pumps:          PumpRow[]
  sleeps:         SleepRow[]
  weights:        WeightRow[]
  babyBirthDate:  string
  babySex:        BabySex
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
      {/* bg-card gives charts a solid backing so they read well over any page background */}
      <div className="rounded-lg bg-card p-2">
        {children}
      </div>
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ExportCharts({ rollup, feeds, pumps, sleeps, weights, babyBirthDate, babySex }: Props) {
  const { tickFill, gridStroke } = useChartTheme()
  const tick = { fontSize: 11, fill: tickFill }

  // ── 1. Daily intake (stacked bar + total trend) ──────────────────────────
  const intakeRaw = rollup.map((r) => ({
    day:           dayLabel(r.day),
    Formula:       Math.round(r.formula_ml),
    'Breast milk': Math.round(r.breast_milk_ml),
    Colostrum:     Math.round(r.colostrum_ml),
    _total:        Math.round(r.formula_ml + r.breast_milk_ml + r.colostrum_ml),
  }))
  const intakeData = addIndexTrend(intakeRaw, (d) => d._total)

  // ── 2. Feed volumes scatter + trend ─────────────────────────────────────
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

  const tsTickFormatter = (v: number) =>
    new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const tsTipLabel = (v: number) =>
    new Date(v).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

  // ── 3. Feed intervals scatter + trend ────────────────────────────────────
  const feedsSorted = [...feeds].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
  const intervalData = feedsSorted.slice(1).map((f, i) => ({
    x: new Date(f.start_at).getTime(),
    y: +((new Date(f.start_at).getTime() - new Date(feedsSorted[i].start_at).getTime()) / (1000 * 60 * 60)).toFixed(2),
  }))
  const intervalTrend = tsTrendLine(intervalData)

  // ── 4. Pump output (line + trend) ────────────────────────────────────────
  const pumpRaw = [...pumps]
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    .map((p) => ({
      x:    new Date(p.start_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric' }),
      y:    p.volume_ml,
    }))
  const pumpData = addIndexTrend(pumpRaw, (d) => d.y)

  // ── 5. Diaper frequency (grouped bar + per-series trends) ─────────────────
  const diaperRaw = rollup.map((r) => ({
    day:   dayLabel(r.day),
    Pees:  Number(r.pee_count),
    Poops: Number(r.poop_count),
  }))
  const peeReg  = linearRegression(diaperRaw.map((d, i) => ({ x: i, y: d.Pees  })))
  const poopReg = linearRegression(diaperRaw.map((d, i) => ({ x: i, y: d.Poops })))
  const diaperData = diaperRaw.map((d, i) => ({
    ...d,
    peeTrend:  peeReg  ? parseFloat((peeReg.slope  * i + peeReg.intercept).toFixed(2))  : undefined,
    poopTrend: poopReg ? parseFloat((poopReg.slope * i + poopReg.intercept).toFixed(2)) : undefined,
  }))

  // ── 6. Sleep duration (line + trend) ────────────────────────────────────
  const sleepRaw = [...(sleeps ?? [])]
    .filter((s) => s.end_at)
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    .map((s) => ({
      x:     new Date(s.start_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric' }),
      hours: parseFloat(((new Date(s.end_at!).getTime() - new Date(s.start_at).getTime()) / (1000 * 60 * 60)).toFixed(2)),
    }))
  const sleepData = addIndexTrend(sleepRaw, (d) => d.hours)

  // ── 7. Weight curve with WHO percentiles + inline trend ──────────────────
  const birthMs        = new Date(babyBirthDate).getTime()
  const percentileTable = getPercentileTable(babySex)

  type WeightPoint = { ageDays: number; p3oz?: number; p50oz?: number; p97oz?: number; weightOz?: number; weightTrend?: number }
  const weightChartData: WeightPoint[] = []

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

  // Compute weight regression and add as an inline field so the trend Line
  // shares the same categorical x-axis as every other Line in the chart.
  const actualWeightPoints = weightChartData
    .filter((d) => d.weightOz !== undefined)
    .map((d) => ({ x: d.ageDays, y: d.weightOz! }))
  const weightReg = linearRegression(actualWeightPoints)
  const weightChartDataWithTrend = weightChartData.map((d) => ({
    ...d,
    weightTrend: weightReg
      ? parseFloat((weightReg.slope * d.ageDays + weightReg.intercept).toFixed(2))
      : undefined,
  }))

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-10 print:space-y-8">

      {/* 1 · Daily intake */}
      {intakeData.length > 0 && (
        <ChartSection
          title="Daily intake by type"
          tooltip="Stacked total ml per day. Dashed line = trend in total daily intake."
        >
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={intakeData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="day" tick={tick} />
              <YAxis unit=" ml" tick={tick} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Formula"     stackId="a" fill="#3b82f6" />
              <Bar dataKey="Breast milk" stackId="a" fill="#ec4899" />
              <Bar dataKey="Colostrum"   stackId="a" fill="#f59e0b" />
              <Line dataKey="trend" name="Trend (total)" stroke="#94a3b8" strokeDasharray={TREND_DASH} strokeWidth={1.5} dot={false} activeDot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* 2 · Feed volumes scatter */}
      {feeds.length > 0 && (
        <ChartSection
          title="Feed volumes over time"
          tooltip="Each dot is one feed. Dashed line = overall volume trend."
        >
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="x" type="number" domain={['auto', 'auto']} tickFormatter={tsTickFormatter} tick={tick} />
              <YAxis dataKey="y" unit=" ml" tick={tick} />
              <Tooltip
                labelFormatter={() => ''}
                formatter={(v, name, p) => {
                  if (name === 'Trend') return null  // hide trend row from per-point tooltip
                  const { x, y } = p.payload as { x: number; y: number }
                  return [`${y} ml`, tsTipLabel(x)]
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {feedScatterByType.formula.length     > 0 && <Scatter name="Formula"     data={feedScatterByType.formula}     fill="#3b82f6" />}
              {feedScatterByType.breast_milk.length > 0 && <Scatter name="Breast milk" data={feedScatterByType.breast_milk} fill="#ec4899" />}
              {feedScatterByType.colostrum.length   > 0 && <Scatter name="Colostrum"   data={feedScatterByType.colostrum}   fill="#f59e0b" />}
              {feedVolumeTrend.length > 0 && (
                <Line data={feedVolumeTrend} dataKey="trend" name="Trend" stroke="#94a3b8" strokeDasharray={TREND_DASH} strokeWidth={1.5} dot={false} activeDot={false} legendType="line" />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* 3 · Feed intervals scatter */}
      {intervalData.length > 0 && (
        <ChartSection
          title="Feed intervals"
          tooltip="Hours between consecutive feed starts. Newborns typically feed every 2–3 h. Dashed line = trend."
        >
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="x" type="number" domain={['auto', 'auto']} tickFormatter={tsTickFormatter} tick={tick} />
              <YAxis dataKey="y" unit=" h" tick={tick} />
              <Tooltip
                labelFormatter={() => ''}
                formatter={(v, name, p) => {
                  if (name === 'Trend') return null
                  const { x, y } = p.payload as { x: number; y: number }
                  return [`${y} h`, tsTipLabel(x)]
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Scatter name="Gap" data={intervalData} fill="#8b5cf6" />
              {intervalTrend.length > 0 && (
                <Line data={intervalTrend} dataKey="trend" name="Trend" stroke="#94a3b8" strokeDasharray={TREND_DASH} strokeWidth={1.5} dot={false} activeDot={false} legendType="line" />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* 4 · Pump output */}
      {pumpData.length > 0 && (
        <ChartSection
          title="Pump output over time"
          tooltip="Volume pumped per session. Dashed line = trend."
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pumpData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="x" tick={tick} interval="preserveStartEnd" />
              <YAxis unit=" ml" tick={tick} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line dataKey="y"     name="Volume (ml)" stroke="#10b981" dot={{ r: 4 }} />
              <Line dataKey="trend" name="Trend"       stroke="#94a3b8" strokeDasharray={TREND_DASH} strokeWidth={1.5} dot={false} activeDot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* 5 · Diaper frequency */}
      {diaperData.length > 0 && (
        <ChartSection
          title="Diaper frequency"
          tooltip="Pees and poops per day. Dashed lines = per-type trends."
        >
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={diaperData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="day" tick={tick} />
              <YAxis allowDecimals={false} tick={tick} />
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

      {/* 6 · Sleep duration */}
      {sleepData.length > 0 && (
        <ChartSection
          title="Sleep duration per session"
          tooltip="Hours per completed sleep session. Dashed line = trend. Consult your pediatrician for age-appropriate sleep guidance."
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sleepData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="x" tick={tick} interval="preserveStartEnd" />
              <YAxis unit=" h" tick={tick} />
              <Tooltip formatter={(v) => [`${v} h`, 'Duration']} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line dataKey="hours" name="Duration (h)" stroke="#6366f1" dot={{ r: 3 }} />
              <Line dataKey="trend" name="Trend"        stroke="#94a3b8" strokeDasharray={TREND_DASH} strokeWidth={1.5} dot={false} activeDot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* 7 · Weight curve */}
      {weights.length > 0 && (
        <ChartSection
          title="Weight curve"
          tooltip={`WHO ${babySex === 'female' ? 'girls' : 'boys'} reference lines (P3 / P50 / P97). Orange dashed = weight trend. Always discuss weight trends with your pediatrician.`}
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weightChartDataWithTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="ageDays" unit=" d" tick={tick} />
              <YAxis tick={tick} tickFormatter={(v) => formatOz(v)} width={70} />
              <Tooltip
                formatter={(v, name) => {
                  const oz = Number(v)
                  if (name === 'Actual weight') return [formatOz(oz), name]
                  if (name === 'Weight trend')  return [formatOz(oz), name]
                  return [`${formatOz(oz)} (WHO)`, name]
                }}
                labelFormatter={(v) => `Day ${v}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line dataKey="p3oz"        name="P3 (WHO)"      stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1} dot={false} connectNulls />
              <Line dataKey="p50oz"       name="P50 (WHO)"     stroke="#64748b" strokeDasharray="6 2" strokeWidth={1} dot={false} connectNulls />
              <Line dataKey="p97oz"       name="P97 (WHO)"     stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1} dot={false} connectNulls />
              <Line dataKey="weightOz"    name="Actual weight" stroke="#ef4444" strokeWidth={2}       dot={{ r: 5 }} connectNulls={false} />
              <Line dataKey="weightTrend" name="Weight trend"  stroke="#f97316" strokeDasharray={TREND_DASH} strokeWidth={1.5} dot={false} activeDot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-1">
            WHO Child Growth Standards (2006) — your pediatrician can help interpret this curve.
          </p>
        </ChartSection>
      )}
    </div>
  )
}
