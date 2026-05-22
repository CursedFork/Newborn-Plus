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
import type { SleepLocation, SleepWakeReason } from '@/lib/database.types'

interface Props {
  open: boolean
  babyId: string
  onClose: () => void
  onSaved: () => void
}

export default function SleepModal({ open, babyId, onClose, onSaved }: Props) {
  const supabase = createClient()

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
    setVoiceUrl(null); setLastSavedId(null)
  }, [open, babyId, supabase])

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

  async function save() {
    setSaving(true)
    const { data, error } = await supabase.from('sleeps').insert({
      baby_id: babyId,
      location,
      start_at: new Date(startAt).toISOString(),
      end_at: endAt ? new Date(endAt).toISOString() : null,
      woken_by: wokenBy || null,
      notes: notes || null,
      voice_note_url: voiceUrl,
    }).select('id').single()
    setSaving(false)
    if (error) { toast.error(error.message); return }
    setLastSavedId(data.id); toast.success('Sleep logged')
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
            Log Sleep
            {lastSavedId && (
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
            {saving ? 'Saving…' : 'Log sleep'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
