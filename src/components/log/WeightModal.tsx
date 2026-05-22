'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { toLocalInputValue } from '@/lib/time'
import { formatOz } from '@/lib/who/percentiles'

interface Props {
  open: boolean
  babyId: string
  onClose: () => void
  onSaved: () => void
}

export default function WeightModal({ open, babyId, onClose, onSaved }: Props) {
  const supabase = createClient()

  const [pounds, setPounds] = useState('')
  const [ounces, setOunces] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [measuredAt, setMeasuredAt] = useState(toLocalInputValue())
  const [saving, setSaving] = useState(false)
  const [lastSavedId, setLastSavedId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setMeasuredAt(toLocalInputValue())
    setPounds(''); setOunces(''); setLocation(''); setNotes('')
    setLastSavedId(null)
  }, [open])

  const totalOz = (parseFloat(pounds || '0') * 16) + parseFloat(ounces || '0')
  const valid = totalOz > 0

  async function save() {
    if (!valid) { toast.error('Enter a weight'); return }
    setSaving(true)
    const { data, error } = await supabase.from('weights').insert({
      baby_id: babyId,
      weight_oz: totalOz,
      location: location || null,
      notes: notes || null,
      measured_at: new Date(measuredAt).toISOString(),
    }).select('id').single()
    setSaving(false)
    if (error) { toast.error(error.message); return }
    setLastSavedId(data.id)
    toast.success(`Weight logged: ${formatOz(totalOz)}`)
    onSaved(); onClose()
  }

  async function undo() {
    if (!lastSavedId) return
    await supabase.from('weights').delete().eq('id', lastSavedId)
    setLastSavedId(null); toast.success('Undone'); onSaved()
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Log Weight
            {lastSavedId && (
              <Button variant="ghost" size="sm" onClick={undo}>
                <Undo2 className="h-4 w-4 mr-1" /> Undo
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label>Weight</Label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  value={pounds}
                  onChange={(e) => setPounds(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1 text-center">lb</p>
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={15.9}
                  step={0.1}
                  value={ounces}
                  onChange={(e) => setOunces(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1 text-center">oz</p>
              </div>
            </div>
            {valid && (
              <p className="text-sm font-medium text-center">{formatOz(totalOz)} ({totalOz.toFixed(1)} oz total)</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Measured at</Label>
            <Input type="datetime-local" value={measuredAt} onChange={(e) => setMeasuredAt(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Location (optional)</Label>
            <Input placeholder="e.g. pediatrician, home scale" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea placeholder="Anything to note…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <Button className="w-full h-14 text-base" onClick={save} disabled={saving || !valid}>
            {saving ? 'Saving…' : 'Log weight'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
