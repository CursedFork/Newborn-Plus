'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mic, MicOff, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { toLocalInputValue } from '@/lib/time'
import type { CreamType, RashStatus, PoopColor, PoopConsistency } from '@/lib/database.types'

interface Props {
  open: boolean
  babyId: string
  onClose: () => void
  onSaved: () => void
}

export default function DiaperModal({ open, babyId, onClose, onSaved }: Props) {
  const supabase = createClient()

  const [pee, setPee] = useState(true)
  const [poop, setPoop] = useState(false)
  const [poopColor, setPoopColor] = useState<PoopColor | ''>('')
  const [poopConsistency, setPoopConsistency] = useState<PoopConsistency | ''>('')
  const [volumeNotes, setVolumeNotes] = useState('')
  const [creamApplied, setCreamApplied] = useState<CreamType>('none')
  const [rashStatus, setRashStatus] = useState<RashStatus | ''>('')
  const [notes, setNotes] = useState('')
  const [changedAt, setChangedAt] = useState(toLocalInputValue())
  const [saving, setSaving] = useState(false)
  const [lastSavedId, setLastSavedId] = useState<string | null>(null)

  const [recording, setRecording] = useState(false)
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (!open) return
    setChangedAt(toLocalInputValue())
    setPee(true); setPoop(false); setPoopColor(''); setPoopConsistency('')
    setVolumeNotes(''); setCreamApplied('none'); setRashStatus(''); setNotes('')
    setVoiceUrl(null); setLastSavedId(null)
  }, [open])

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
        const path = `${babyId}/diapers/${Date.now()}.webm`
        const { data, error } = await supabase.storage.from('voice-notes').upload(path, blob)
        if (error) { toast.error('Voice upload failed'); return }
        const { data: urlData } = supabase.storage.from('voice-notes').getPublicUrl(data.path)
        setVoiceUrl(urlData.publicUrl)
        toast.success('Voice note saved')
      }
      mr.start(); recorderRef.current = mr; setRecording(true)
    } catch { toast.error('Microphone access denied') }
  }

  async function save() {
    if (!pee && !poop) { toast.error('Select at least pee or poop'); return }
    setSaving(true)
    const { data, error } = await supabase.from('diapers').insert({
      baby_id: babyId,
      pee,
      poop,
      poop_color: poop && poopColor ? poopColor : null,
      poop_consistency: poop && poopConsistency ? poopConsistency : null,
      volume_notes: volumeNotes || null,
      cream_applied: creamApplied,
      rash_status: rashStatus || null,
      notes: notes || null,
      changed_at: new Date(changedAt).toISOString(),
      voice_note_url: voiceUrl,
    }).select('id').single()
    setSaving(false)
    if (error) { toast.error(error.message); return }
    setLastSavedId(data.id)
    toast.success('Diaper logged')
    onSaved(); onClose()
  }

  async function undo() {
    if (!lastSavedId) return
    await supabase.from('diapers').delete().eq('id', lastSavedId)
    setLastSavedId(null); toast.success('Undone'); onSaved()
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Log Diaper
            {lastSavedId && (
              <Button variant="ghost" size="sm" onClick={undo}>
                <Undo2 className="h-4 w-4 mr-1" /> Undo
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pt-4">
          {/* Time */}
          <div className="space-y-2">
            <Label>Changed at</Label>
            <Input type="datetime-local" value={changedAt} onChange={(e) => setChangedAt(e.target.value)} />
          </div>

          {/* Pee / Poop toggles */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPee(!pee)}
              className={`rounded-2xl p-5 text-center font-semibold transition-colors border-2 ${pee ? 'bg-yellow-400/20 border-yellow-400 text-yellow-700 dark:text-yellow-300' : 'border-border text-muted-foreground'}`}
            >
              💛 Pee
            </button>
            <button
              onClick={() => setPoop(!poop)}
              className={`rounded-2xl p-5 text-center font-semibold transition-colors border-2 ${poop ? 'bg-amber-700/20 border-amber-700 text-amber-700 dark:text-amber-300' : 'border-border text-muted-foreground'}`}
            >
              💩 Poop
            </button>
          </div>

          {/* Poop details */}
          {poop && (
            <>
              <div className="space-y-2">
                <Label>Poop color</Label>
                <Select value={poopColor} onValueChange={(v) => v != null && setPoopColor(v as PoopColor)}>
                  <SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger>
                  <SelectContent>
                    {(['black','dark_green','brown','yellow','mustard','other'] as PoopColor[]).map((c) => (
                      <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Poop consistency</Label>
                <Select value={poopConsistency} onValueChange={(v) => v != null && setPoopConsistency(v as PoopConsistency)}>
                  <SelectTrigger><SelectValue placeholder="Select consistency" /></SelectTrigger>
                  <SelectContent>
                    {(['tarry','seedy','grainy','runny','formed','other'] as PoopConsistency[]).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Volume notes */}
          <div className="space-y-2">
            <Label>Volume notes (optional)</Label>
            <Input placeholder="e.g. lots of pee, record amount" value={volumeNotes} onChange={(e) => setVolumeNotes(e.target.value)} />
          </div>

          {/* Rash status */}
          <div className="space-y-2">
            <Label>Rash status</Label>
            <Select value={rashStatus} onValueChange={(v) => v != null && setRashStatus(v as RashStatus)}>
              <SelectTrigger><SelectValue placeholder="No rash noted" /></SelectTrigger>
              <SelectContent>
                {(['none','mild','moderate','severe','improving','resolved'] as RashStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cream applied */}
          <div className="space-y-2">
            <Label>Cream applied</Label>
            <Select value={creamApplied} onValueChange={(v) => v != null && setCreamApplied(v as CreamType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['none','vaseline','aquaphor','desitin','zinc_oxide_40'] as CreamType[]).map((c) => (
                  <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea placeholder="Anything unusual to note…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {/* Voice note */}
          <div className="flex items-center gap-3">
            <Button type="button" variant={recording ? 'destructive' : 'outline'} size="sm" onClick={toggleRecording} className="gap-2">
              {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {recording ? 'Stop recording' : 'Voice note'}
            </Button>
            {voiceUrl && <span className="text-xs text-muted-foreground">Voice note saved</span>}
          </div>

          <Button className="w-full h-14 text-base" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Log diaper'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
