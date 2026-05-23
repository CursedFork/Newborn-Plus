'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Mic, MicOff, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { toLocalInputValue } from '@/lib/time'
import { useAppearance } from '@/contexts/AppearanceContext'
import { formatVolume } from '@/lib/units'
import type { PumpOutputType, PumpSide, PumpRow } from '@/lib/database.types'

interface Props {
  open: boolean
  babyId: string
  onClose: () => void
  onSaved: () => void
  initialData?: PumpRow
}

export default function PumpModal({ open, babyId, onClose, onSaved, initialData }: Props) {
  const supabase = createClient()
  const { volumeUnit } = useAppearance()
  const isEditing = !!initialData

  const [outputType, setOutputType] = useState<PumpOutputType>('mature_milk')
  const [volumeMl, setVolumeMl] = useState(60)
  const [durationMin, setDurationMin] = useState<number | undefined>()
  const [side, setSide] = useState<PumpSide | ''>('')
  const [consistencyNotes, setConsistencyNotes] = useState('')
  const [startAt, setStartAt] = useState(toLocalInputValue())
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
      setOutputType(initialData.output_type)
      setVolumeMl(initialData.volume_ml)
      setDurationMin(initialData.duration_min ?? undefined)
      setSide(initialData.side ?? '')
      setConsistencyNotes(initialData.consistency_notes ?? '')
      setStartAt(toLocalInputValue(new Date(initialData.start_at)))
      setVoiceUrl(initialData.voice_note_url)
    } else {
      supabase
        .from('pumps')
        .select('output_type, volume_ml, side')
        .eq('baby_id', babyId)
        .order('start_at', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => {
          if (data) {
            setOutputType(data.output_type as PumpOutputType)
            setVolumeMl(data.volume_ml)
            if (data.side) setSide(data.side as PumpSide)
          }
        })
      setStartAt(toLocalInputValue())
      setConsistencyNotes(''); setDurationMin(undefined)
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
        const path = `${babyId}/pumps/${Date.now()}.webm`
        const { data, error } = await supabase.storage.from('voice-notes').upload(path, blob)
        if (error) { toast.error('Voice upload failed'); return }
        const { data: urlData } = supabase.storage.from('voice-notes').getPublicUrl(data.path)
        setVoiceUrl(urlData.publicUrl); toast.success('Voice note saved')
      }
      mr.start(); recorderRef.current = mr; setRecording(true)
    } catch { toast.error('Microphone access denied') }
  }

  const payload = {
    output_type: outputType,
    volume_ml: volumeMl,
    duration_min: durationMin ?? null,
    side: side || null,
    consistency_notes: consistencyNotes || null,
    start_at: new Date(startAt).toISOString(),
    voice_note_url: voiceUrl,
  }

  async function save() {
    setSaving(true)
    if (isEditing) {
      const { error } = await supabase.from('pumps').update(payload).eq('id', initialData!.id)
      setSaving(false)
      if (error) { toast.error(error.message); return }
      toast.success('Pump updated')
      onSaved(); onClose()
    } else {
      const { data, error } = await supabase.from('pumps').insert({ baby_id: babyId, ...payload }).select('id').single()
      setSaving(false)
      if (error) { toast.error(error.message); return }
      setLastSavedId(data.id)
      toast.success('Pump logged')
      onSaved(); onClose()
    }
  }

  async function handleDelete() {
    if (!initialData) return
    setSaving(true)
    const { error } = await supabase.from('pumps').delete().eq('id', initialData.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Pump deleted')
    onSaved(); onClose()
  }

  async function undo() {
    if (!lastSavedId) return
    await supabase.from('pumps').delete().eq('id', lastSavedId)
    setLastSavedId(null); toast.success('Undone'); onSaved()
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            {isEditing ? 'Edit Pump' : 'Log Pump'}
            {!isEditing && lastSavedId && (
              <Button variant="ghost" size="sm" onClick={undo}>
                <Undo2 className="h-4 w-4 mr-1" /> Undo
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label>Output type</Label>
            <Select value={outputType} onValueChange={(v) => v != null && setOutputType(v as PumpOutputType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="colostrum">Colostrum</SelectItem>
                <SelectItem value="transitional">Transitional</SelectItem>
                <SelectItem value="mature_milk">Mature milk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Volume: <strong>{formatVolume(volumeMl, volumeUnit)}</strong></Label>
            <Slider min={0} max={300} step={5} value={volumeMl} onValueChange={(v) => setVolumeMl(Array.isArray(v) ? v[0] : v)} className="touch-none" />
          </div>

          <div className="space-y-2">
            <Label>Duration (minutes, optional)</Label>
            <Input type="number" placeholder="e.g. 20" value={durationMin ?? ''} onChange={(e) => setDurationMin(e.target.value ? +e.target.value : undefined)} />
          </div>

          <div className="space-y-2">
            <Label>Side</Label>
            <Select value={side} onValueChange={(v) => v != null && setSide(v as PumpSide)}>
              <SelectTrigger><SelectValue placeholder="Both / not specified" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Started at</Label>
            <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Consistency notes (optional)</Label>
            <Textarea placeholder="Color, thickness, anything notable…" value={consistencyNotes} onChange={(e) => setConsistencyNotes(e.target.value)} />
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant={recording ? 'destructive' : 'outline'} size="sm" onClick={toggleRecording} className="gap-2">
              {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {recording ? 'Stop recording' : 'Voice note'}
            </Button>
            {voiceUrl && <span className="text-xs text-muted-foreground">Voice note saved</span>}
          </div>

          <Button className="w-full h-14 text-base" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Log pump'}
          </Button>

          {isEditing && (
            <Button variant="destructive" className="w-full" onClick={handleDelete} disabled={saving}>
              Delete this pump
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
