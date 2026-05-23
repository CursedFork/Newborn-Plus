'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import type { DailyRollupRow } from '@/lib/database.types'
import { ML_PER_OZ, type VolumeUnit } from '@/lib/units'

interface Props {
  data: DailyRollupRow[]
  unit?: VolumeUnit
}

function toDisplay(ml: number, unit: VolumeUnit): number {
  return unit === 'oz'
    ? parseFloat((ml / ML_PER_OZ).toFixed(2))
    : Math.round(ml)
}

export default function IntakeChart({ data, unit = 'ml' }: Props) {
  const chartData = data.map((row) => ({
    day: new Date(row.day + 'T12:00:00Z').toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
    }),
    formula: toDisplay(row.formula_ml, unit),
    breast_milk: toDisplay(row.breast_milk_ml, unit),
    colostrum: toDisplay(row.colostrum_ml, unit),
  }))

  const hasFormula = data.some((r) => r.formula_ml > 0)
  const hasBreastMilk = data.some((r) => r.breast_milk_ml > 0)
  const hasColostrum = data.some((r) => r.colostrum_ml > 0)

  return (
    <ResponsiveContainer width="100%" height={130}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => unit === 'oz' ? `${v}` : `${v}`}
        />
        <Tooltip
          formatter={(v, name) => [
            `${Number(v).toFixed(unit === 'oz' ? 1 : 0)} ${unit}`,
            String(name).replace('_', ' '),
          ]}
          contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid hsl(var(--border))' }}
          labelStyle={{ fontWeight: 600 }}
        />
        {hasFormula && (
          <Bar dataKey="formula" stackId="a" fill="#3b82f6" name="Formula" />
        )}
        {hasBreastMilk && (
          <Bar dataKey="breast_milk" stackId="a" fill="#ec4899" name="Breast milk" />
        )}
        {hasColostrum && (
          <Bar dataKey="colostrum" stackId="a" fill="#f59e0b" name="Colostrum" />
        )}
        {!hasFormula && !hasBreastMilk && !hasColostrum && (
          <Bar dataKey="formula" stackId="a" fill="#e5e7eb" name="No data" />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}
