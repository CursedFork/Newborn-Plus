'use client'

import type { DailyRollupRow } from '@/lib/database.types'
import { formatOz } from '@/lib/who/percentiles'

interface Props {
  rows: DailyRollupRow[]
}

function fml(v: number) {
  return v > 0 ? `${Math.round(v)} ml` : '—'
}

function fcount(v: number) {
  return v > 0 ? String(v) : '—'
}

function fhrs(v: number) {
  return v > 0 ? `${v.toFixed(1)} h` : '—'
}

export default function RollupTable({ rows }: Props) {
  if (rows.length === 0) return <p className="text-muted-foreground text-sm">No data for selected range.</p>

  return (
    <div className="overflow-x-auto -mx-4 px-4 print:mx-0 print:px-0">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-2 pr-3 font-semibold whitespace-nowrap">Date</th>
            <th className="py-2 pr-3 font-semibold whitespace-nowrap text-right">Formula</th>
            <th className="py-2 pr-3 font-semibold whitespace-nowrap text-right">Breast milk</th>
            <th className="py-2 pr-3 font-semibold whitespace-nowrap text-right">Colostrum</th>
            <th className="py-2 pr-3 font-semibold whitespace-nowrap text-right">Feeds</th>
            <th className="py-2 pr-3 font-semibold whitespace-nowrap text-right">Pees</th>
            <th className="py-2 pr-3 font-semibold whitespace-nowrap text-right">Poops</th>
            <th className="py-2 pr-3 font-semibold whitespace-nowrap text-right">Sleep</th>
            <th className="py-2 font-semibold whitespace-nowrap text-right">Weight</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.day} className="border-b border-border/50 hover:bg-muted/30 print:hover:bg-transparent">
              <td className="py-2 pr-3 whitespace-nowrap font-medium">
                {new Date(row.day + 'T12:00:00Z').toLocaleDateString(undefined, {
                  weekday: 'short', month: 'short', day: 'numeric'
                })}
              </td>
              <td className="py-2 pr-3 text-right tabular-nums text-blue-600 dark:text-blue-400">{fml(row.formula_ml)}</td>
              <td className="py-2 pr-3 text-right tabular-nums text-pink-600 dark:text-pink-400">{fml(row.breast_milk_ml)}</td>
              <td className="py-2 pr-3 text-right tabular-nums text-amber-600 dark:text-amber-400">{fml(row.colostrum_ml)}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{fcount(Number(row.feed_count))}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{fcount(Number(row.pee_count))}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{fcount(Number(row.poop_count))}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{fhrs(row.sleep_hours)}</td>
              <td className="py-2 text-right tabular-nums">
                {row.weight_oz != null ? formatOz(row.weight_oz) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
