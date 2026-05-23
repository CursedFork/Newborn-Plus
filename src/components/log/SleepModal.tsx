'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mic, MicOff, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { toLocalInputValue } from '@/lib/time'
import type { SleepLocation, SleepWakeReason, SleepRow } from '@/lib/database.types'

interface Props {
  open: boolean
  babyId: string
  onClose: () => void
  onSaved: () => void
  initialData?: SleepRow
}

export default function SleepModal({ open, babyId, onClose, onSaved, initialData }: Props) {
  const supabase = createClient()
  const isEditing = !!initialData

  const [location, setLocation] = useState<SleepLocation>('bassinet')
  const [startAt, setStartAt] = useState(toLocalInputValue())
  const [endAt, setEndAt] = useState('')
  const [wokenBy, setWokenBy] = useState<SleepWakeReason | ''>('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastSavedId, setLastSavedId] = useState<string | null>(null)

  const [recording, setRecording] = useState(false)
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (!open) return
    setLastSavedId(null)

    if (initialData) {
      setLocation(initialData.location)
      setStartAt(toLocalInputValue(new Date(initialData.start_at)))
      setEndAt(initialData.end_at ? toLocalInputValue(new Date(initialData.end_at)) : '')
      setWokenBy(initialData.woken_by ?? '')
      setNotes(initialData.notes ?? '')
      setVoiceUrl(initialData.voice_note_url)
    } else {
      supabase
        .from('sleeps')
        .select('location')
        .eq('baby_id', babyId)
        .order('start_at', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => { if (data) setLocation(data.location as SleepLocation) })
      setStartAt(toLocalInputValue())
      setEndAt(''); setWokenBy(''); setNotes('')
      setVoiceUrl(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, babyId, initialData?.id])

  async function toggleRecording() {
    if (recording) { recorderRef.current?.stop(); setRecording(false); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const path = `${babyId}/sleeps/${Date.now()}.webm`
        const { data, error } = await supabase.storage.from('voice-notes').upload(path, blob)
        if (error) { toast.error('Voice upload failed'); return }
        const { data: urlData } = supabase.storage.from('voice-notes').getPublicUrl(data.path)
        setVoiceUrl(urlData.publicUrl); toast.success('Voice note saved')
      }
      mr.start(); recorderRef.current = mr; setRecording(true)
    } catch { toast.error('Microphone access denied') }
  }

  const payload = {
    location,
    start_at: new Date(startAt).toISOString(),
    end_at: endAt ? new Date(endAt).toISOString() : null,
    woken_by: wokenBy || null,
    notes: notes || null,
    voice_note_url: voiceUrl,
  }

  async function save() {
    setSaving(true)
    if (isEditing) {
      const { error } = await supabase.from('sleeps').update(payload).eq('id', initialData!.id)
      setSaving(false)
      if (error) { toast.error(error.message); return }
      toast.success('Sleep updated')
      onSaved(); onClose()
    } else {
      const { data, error } = await supabase.from('sleeps').insert({ baby_id: babyId, ...payload }).select('id').single()
      setSaving(false)
      if (error) { toast.error(error.message); return }
      setLastSavedId(data.id)
      toast.success('Sleep logged')
      onSaved(); onClose()
    }
  }

  async function handleDelete() {
    if (!initialData) return
    setSaving(true)
    const { error } = await supabase.from('sleeps').delete().eq('id', initialData.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Sleep deleted')
    onSaved(); onClose()
  }

  async function undo() {
    if (!lastSavedId) return
    await supabase.from('sleeps').delete().eq('id', lastSavedId)
    setLastSavedId(null); toast.success('Undone'); onSaved()
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            {isEditing ? 'Edit Sleep' : 'Log Sleep'}
            {!isEditing && lastSavedId && (
              <Button variant="ghost" size="sm" onClick={undo}>
                <Undo2 className="h-4 w-4 mr-1" /> Undo
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label>Location</Label>
            <Select value={location} onValueChange={(v) => v != null && setLocation(v as SleepLocation)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['bassinet','crib','parent_arms','pack_and_play','car_seat','other'] as SleepLocation[]).map((l) => (
                  <SelectItem key={l} value={l}>{l.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Started at</Label>
            <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Woke up at (leave blank if still sleeping)</Label>
            <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
          </div>

          {endAt && (
            <div className="space-y-2">
              <Label>Woken by</Label>
              <Select value={wokenBy} onValueChange={(v) => v != null && setWokenBy(v as SleepWakeReason)}>
                <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  {(['self','parent_for_feed','diaper','fussy','noise','other'] as SleepWakeReason[]).map((r) => (
                    <SelectItem key={r} value={r}>{r.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea placeholder="Anything to note about this sleep…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant={recording ? 'destructive' : 'outline'} size="sm" onClick={toggleRecording} className="gap-2">
              {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {recording ? 'Stop recording' : 'Voice note'}
            </Button>
            {voiceUrl && <span className="text-xs text-muted-foreground">Voice note saved</span>}
          </div>

          <Button className="w-full h-14 text-base" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Log sleep'}
          </Button>

          {isEditing && (
            <Button variant="destructive" className="w-full" onClick={handleDelete} disabled={saving}>
              Delete this sleep
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
