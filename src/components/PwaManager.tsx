'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

/** Registers SW, listens for offline queue flush messages, shows "waking up database" state. */
export default function PwaManager() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch(() => {})

    // When SW tells us we're back online, flush any queued writes
    navigator.serviceWorker.addEventListener('message', async (event) => {
      if (event.data?.type !== 'FLUSH_OFFLINE_QUEUE') return

      const raw = localStorage.getItem('offline-write-queue')
      if (!raw) return
      const queue: Array<{ table: string; payload: Record<string, unknown> }> = JSON.parse(raw)
      if (queue.length === 0) return

      const supabase = createClient()
      const remaining: typeof queue = []

      for (const item of queue) {
        const { error } = await supabase.from(item.table).insert(item.payload)
        if (error) remaining.push(item)
      }

      if (remaining.length < queue.length) {
        const synced = queue.length - remaining.length
        toast.success(`Synced ${synced} offline log${synced !== 1 ? 's' : ''}`)
      }
      if (remaining.length > 0) {
        localStorage.setItem('offline-write-queue', JSON.stringify(remaining))
      } else {
        localStorage.removeItem('offline-write-queue')
      }
    })

    // Detect Supabase project pausing (503 with specific message)
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const res = await originalFetch(...args)
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url
      if (res.status === 503 && url.includes('supabase.co')) {
        toast.warning('Database is waking up…', {
          description: 'Your Supabase project may be paused. Retrying in a moment.',
          duration: 8000,
        })
      }
      return res
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return null
}
