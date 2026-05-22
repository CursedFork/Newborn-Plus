'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { toLocalInputValue } from '@/lib/time'
import type { PedNoteType } from '@/lib/database.types'

interface Props {
  open: boolean
  babyId: string
  onClose: () => void
  onSaved: () => void
}

export default function PedNoteModal({ open, babyId, onClose, onSaved }: Props) {
  const supabase = createClient()

  const [type, setType] = useState<PedNoteType>('question')
  const [content, setContent] = useState('')
  const [occurredAt, setOccurredAt] = useState(toLocalInputValue())
  const [saving, setSaving] = useState(false)
  const [lastSavedId, setLastSavedId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setOccurredAt(toLocalInputValue())
    setContent(''); setType('question'); setLastSavedId(null)
  }, [open])

  async function save() {
    if (!content.trim()) { toast.error('Enter a note'); return }
    setSaving(true)
    const { data, error } = await supabase.from('pediatrician_notes').insert({
      baby_id: babyId,
      type,
      status: type === 'instruction_received' ? 'resolved' : 'open',
      content: content.trim(),
      occurred_at: new Date(occurredAt).toISOString(),
    }).select('id').single()
    setSaving(false)
    if (error) { toast.error(error.message); return }
    setLastSavedId(data.id)
    toast.success('Note logged')
    onSaved(); onClose()
  }

  async function undo() {
    if (!lastSavedId) return
    await supabase.from('pediatrician_notes').delete().eq('id', lastSavedId)
    setLastSavedId(null); toast.success('Undone'); onSaved()
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Pediatrician Note
            {lastSavedId && (
              <Button variant="ghost" size="sm" onClick={undo}>
                <Undo2 className="h-4 w-4 mr-1" /> Undo
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => v != null && setType(v as PedNoteType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="question">Question for pediatrician</SelectItem>
                <SelectItem value="observation_to_share">Observation to share</SelectItem>
                <SelectItem value="instruction_received">Instruction received</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date / time</Label>
            <Input type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>
              {type === 'question' ? 'Your question' :
               type === 'instruction_received' ? 'What did the pediatrician say?' :
               'What did you observe?'}
            </Label>
            <Textarea
              placeholder={
                type === 'question' ? 'e.g. Baby refused full bottle at 4am — should we be concerned?' :
                type === 'instruction_received' ? 'e.g. Use 40% zinc oxide for rash flare-ups.' :
                'e.g. Noticed yellow spots in mouth around 8pm.'
              }
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Your pediatrician can interpret these notes — always consult them for medical guidance.
          </p>

          <Button className="w-full h-14 text-base" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save note'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
