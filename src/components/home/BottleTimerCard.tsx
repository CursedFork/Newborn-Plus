'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/lib/database.types'

type Feed = Database['public']['Tables']['feeds']['Row']

const LIMITS_MS = {
  formula: 60 * 60 * 1000,       // 1 hour
  breast_milk: 2 * 60 * 60 * 1000, // 2 hours
  colostrum: 2 * 60 * 60 * 1000,
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Expired'
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export default function BottleTimerCard({ feed, onDismiss }: { feed: Feed; onDismiss?: () => void }) {
  const limitMs = LIMITS_MS[feed.type]
  const startMs = new Date(feed.start_at).getTime()

  const [remainingMs, setRemainingMs] = useState(() =>
    startMs + limitMs - Date.now()
  )

  useEffect(() => {
    const id = setInterval(() => {
      setRemainingMs(startMs + limitMs - Date.now())
    }, 1000)
    return () => clearInterval(id)
  }, [startMs, limitMs])

  const pct = Math.max(0, remainingMs / limitMs)
  const expired = remainingMs <= 0
  const warning = !expired && remainingMs < 15 * 60 * 1000

  return (
    <Card className={cn(
      'border-2 transition-colors',
      expired ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
      warning ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20' :
      'border-border'
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium capitalize">{feed.type.replace('_', ' ')} bottle</p>
            {feed.formula_brand && (
              <p className="text-xs text-muted-foreground">{feed.formula_brand}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-2xl font-mono font-bold tabular-nums',
              expired ? 'text-red-600' : warning ? 'text-yellow-600' : 'text-foreground'
            )}>
              {formatRemaining(remainingMs)}
            </span>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={onDismiss}
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              expired ? 'bg-red-500 w-full' :
              warning ? 'bg-yellow-400' :
              'bg-blue-500'
            )}
            style={{ width: `${(1 - pct) * 100}%` }}
          />
        </div>
        {expired && (
          <p className="text-xs text-red-600 mt-1 font-medium">Discard this bottle</p>
        )}
        {warning && !expired && (
          <p className="text-xs text-yellow-600 mt-1">Less than 15 min remaining</p>
        )}
      </CardContent>
    </Card>
  )
}
