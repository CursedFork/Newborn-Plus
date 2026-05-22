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
import { Slider } from '@/components/ui/slider'
import { Mic, MicOff, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { toLocalInputValue } from '@/lib/time'
import type { FeedType } from '@/lib/database.types'

interface Props {
  open: boolean
  babyId: string
  onClose: () => void
  onSaved: () => void
}

const FORMULA_BRANDS = ['Similac 360', 'Enfamil', 'Bobbie', 'Other']

export default function FeedModal({ open, babyId, onClose, onSaved }: Props) {
  const supabase = createClient()

  const [type, setType] = useState<FeedType>('formula')
  const [formulaBrand, setFormulaBrand] = useState('Similac 360')
  const [volumeMl, setVolumeMl] = useState(60)
  const [volumeOfferedMl, setVolumeOfferedMl] = useState<number | undefined>()
  const [bottleType, setBottleType] = useState('')
  const [spitUp, setSpitUp] = useState(false)
  const [spitUpNotes, setSpitUpNotes] = useState('')
  const [fusinessNotes, setFussinessNotes] = useState('')
  const [startAt, setStartAt] = useState(toLocalInputValue())
  const [saving, setSaving] = useState(false)
  const [lastSavedId, setLastSavedId] = useState<string | null>(null)

  // Voice note
  const [recording, setRecording] = useState(false)
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Pre-fill from last feed
  useEffect(() => {
    if (!open) return
    supabase
      .from('feeds')
      .select('type, formula_brand, volume_ml, bottle_type')
      .eq('baby_id', babyId)
      .order('start_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setType(data.type as FeedType)
          if (data.formula_brand) setFormulaBrand(data.formula_brand)
          setVolumeMl(data.volume_ml)
          if (data.bottle_type) setBottleType(data.bottle_type)
        }
      })
    setStartAt(toLocalInputValue())
    setSpitUp(false)
    setSpitUpNotes('')
    setFussinessNotes('')
    setVolumeOfferedMl(undefined)
    setVoiceUrl(null)
    setLastSavedId(null)
  }, [open, babyId, supabase])

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop()
      setRecording(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const path = `${babyId}/feeds/${Date.now()}.webm`
        const { data, error } = await supabase.storage
          .from('voice-notes')
          .upload(path, blob)
        if (error) { toast.error('Voice upload failed'); return }
        const { data: urlData } = supabase.storage.from('voice-notes').getPublicUrl(data.path)
        setVoiceUrl(urlData.publicUrl)
        toast.success('Voice note saved')
      }
      mr.start()
      recorderRef.current = mr
      setRecording(true)
    } catch {
      toast.error('Microphone access denied')
    }
  }

  async function save() {
    setSaving(true)
    const { data, error } = await supabase.from('feeds').insert({
      baby_id: babyId,
      type,
      formula_brand: type === 'formula' ? formulaBrand : null,
      volume_ml: volumeMl,
      volume_offered_ml: volumeOfferedMl ?? null,
      bottle_type: bottleType || null,
      spit_up: spitUp,
      spit_up_notes: spitUp ? spitUpNotes || null : null,
      fussiness_notes: fusinessNotes || null,
      start_at: new Date(startAt).toISOString(),
      voice_note_url: voiceUrl,
    }).select('id').single()

    setSaving(false)
    if (error) { toast.error(error.message); return }
    setLastSavedId(data.id)
    toast.success('Feed logged')
    onSaved()
    onClose()
  }

  async function undo() {
    if (!lastSavedId) return
    await supabase.from('feeds').delete().eq('id', lastSavedId)
    setLastSavedId(null)
    toast.success('Undone')
    onSaved()
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Log Feed
            {lastSavedId && (
              <Button variant="ghost" size="sm" onClick={undo}>
                <Undo2 className="h-4 w-4 mr-1" /> Undo
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pt-4">
          {/* Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => v != null && setType(v as FeedType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="formula">Formula</SelectItem>
                <SelectItem value="breast_milk">Breast milk</SelectItem>
                <SelectItem value="colostrum">Colostrum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Formula brand */}
          {type === 'formula' && (
            <div className="space-y-2">
              <Label>Brand</Label>
              <Select value={formulaBrand} onValueChange={(v) => v != null && setFormulaBrand(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FORMULA_BRANDS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Volume */}
          <div className="space-y-2">
            <Label>Volume taken: <strong>{volumeMl} ml</strong></Label>
            <Slider
              min={0} max={240} step={5}
              value={volumeMl}
              onValueChange={(v) => setVolumeMl(Array.isArray(v) ? v[0] : v)}
              className="touch-none"
            />
          </div>

          {/* Volume offered */}
          <div className="space-y-2">
            <Label>Volume offered (optional)</Label>
            <Input
              type="number"
              placeholder="e.g. 60"
              value={volumeOfferedMl ?? ''}
              onChange={(e) => setVolumeOfferedMl(e.target.value ? +e.target.value : undefined)}
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label>Started at</Label>
            <Input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </div>

          {/* Bottle type */}
          <div className="space-y-2">
            <Label>Bottle type (optional)</Label>
            <Input
              placeholder="e.g. Dr Browns size 1 slow flow"
              value={bottleType}
              onChange={(e) => setBottleType(e.target.value)}
            />
          </div>

          {/* Spit up */}
          <div className="flex items-center justify-between">
            <Label htmlFor="spit-up">Spit up?</Label>
            <Switch id="spit-up" checked={spitUp} onCheckedChange={setSpitUp} />
          </div>
          {spitUp && (
            <div className="space-y-2">
              <Label>Spit-up notes</Label>
              <Textarea
                placeholder="Amount, timing, etc."
                value={spitUpNotes}
                onChange={(e) => setSpitUpNotes(e.target.value)}
              />
            </div>
          )}

          {/* Fussiness notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Fussiness, behavior, anything worth noting…"
              value={fusinessNotes}
              onChange={(e) => setFussinessNotes(e.target.value)}
            />
          </div>

          {/* Voice note */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant={recording ? 'destructive' : 'outline'}
              size="sm"
              onClick={toggleRecording}
              className="gap-2"
            >
              {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {recording ? 'Stop recording' : 'Voice note'}
            </Button>
            {voiceUrl && <span className="text-xs text-muted-foreground">Voice note saved</span>}
          </div>

          {/* Save */}
          <Button className="w-full h-14 text-base" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Log feed'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
