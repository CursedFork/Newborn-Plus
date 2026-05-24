'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBaby } from '@/contexts/BabyContext'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import PedNoteModal from '@/components/log/PedNoteModal'
import type { PedNoteRow, PedNoteType } from '@/lib/database.types'

// ── Display helpers ────────────────────────────────────────────────────────

const TYPE_META: Record<PedNoteType, { label: string; badge: string }> = {
  question:             { label: 'Question',    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  observation_to_share: { label: 'Observation', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  instruction_received: { label: 'Instruction', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ── Sub-components ─────────────────────────────────────────────────────────

function NoteCard({
  note,
  onAnswerClick,
  onEditClick,
}: {
  note: PedNoteRow
  onAnswerClick: (n: PedNoteRow) => void
  onEditClick: (n: PedNoteRow) => void
}) {
  const meta = TYPE_META[note.type]
  const isOpen = note.status === 'open'

  return (
    <div
      className="rounded-xl border bg-card p-4 space-y-2.5 cursor-pointer hover:bg-accent/40 transition-colors"
      onClick={() => (isOpen ? onAnswerClick(note) : onEditClick(note))}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}>
            {meta.label}
          </span>
          {note.status === 'answered' && (
            <span className="inline-flex items-center rounded-full border border-emerald-300 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Answered
            </span>
          )}
          {note.status === 'resolved' && (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Resolved
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <span className="text-xs text-muted-foreground">{formatDate(note.occurred_at)}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation()
              onEditClick(note)
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Note content */}
      <p className="text-sm leading-relaxed">{note.content}</p>

      {/* Answer (if present) */}
      {note.answer && (
        <div className="rounded-lg bg-muted px-3 py-2 text-sm">
          <span className="font-medium">Dr&apos;s answer: </span>
          <span className="text-muted-foreground">{note.answer}</span>
        </div>
      )}

      {/* Tap hint for open items */}
      {isOpen && note.type === 'question' && (
        <p className="text-xs text-muted-foreground">Tap to record answer</p>
      )}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="text-5xl">🩺</div>
      <p className="text-muted-foreground text-sm max-w-[220px]">{message}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function PedNotesPage() {
  const supabase = createClient()
  const { baby, loading: babyLoading } = useBaby()

  const [notes, setNotes] = useState<PedNoteRow[]>([])
  const [fetching, setFetching] = useState(true)

  // Add-new modal
  const [addOpen, setAddOpen] = useState(false)

  // Edit modal
  const [editTarget, setEditTarget] = useState<PedNoteRow | null>(null)

  // Answer-recording sheet
  const [answerTarget, setAnswerTarget] = useState<PedNoteRow | null>(null)
  const [answerText, setAnswerText] = useState('')
  const [saving, setSaving] = useState(false)

  // ── Data fetch ────────────────────────────────────────────────────────────

  const fetchNotes = useCallback(async () => {
    if (!baby) return
    setFetching(true)
    const { data, error } = await supabase
      .from('pediatrician_notes')
      .select('*')
      .eq('baby_id', baby.id)
      .order('occurred_at', { ascending: false })
    if (error) toast.error(error.message)
    setNotes((data as PedNoteRow[]) ?? [])
    setFetching(false)
  }, [baby, supabase])

  useEffect(() => {
    if (!babyLoading && baby) fetchNotes()
  }, [babyLoading, baby, fetchNotes])

  // ── Derived lists ─────────────────────────────────────────────────────────

  const openNotes = notes.filter((n) => n.status === 'open')
  const closedNotes = notes.filter((n) => n.status !== 'open')

  // ── Answer sheet handlers ─────────────────────────────────────────────────

  function handleAnswerClick(note: PedNoteRow) {
    setAnswerTarget(note)
    setAnswerText(note.answer ?? '')
  }

  async function saveAnswer() {
    if (!answerTarget) return
    setSaving(true)
    const { error } = await supabase
      .from('pediatrician_notes')
      .update({
        answer: answerText.trim() || null,
        answered_at: new Date().toISOString(),
        status: 'answered',
      })
      .eq('id', answerTarget.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Answer saved')
    setAnswerTarget(null)
    fetchNotes()
  }

  // Switch from answer sheet → edit modal without visual glitch
  function openEditFromAnswerSheet() {
    const target = answerTarget
    setAnswerTarget(null)
    setTimeout(() => setEditTarget(target), 200)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const isLoading = babyLoading || fetching

  return (
    <div className="px-4 pb-6 pt-4 space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Doctor Notes</h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add note
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="open">
          <TabsList className="w-full">
            <TabsTrigger value="open" className="flex-1">
              Open{openNotes.length > 0 ? ` (${openNotes.length})` : ''}
            </TabsTrigger>
            <TabsTrigger value="answered" className="flex-1">
              Answered{closedNotes.length > 0 ? ` (${closedNotes.length})` : ''}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-3 pt-4">
            {openNotes.length === 0 ? (
              <EmptyState message="No open notes. Tap + to log a question or observation before your appointment." />
            ) : (
              openNotes.map((n) => (
                <NoteCard
                  key={n.id}
                  note={n}
                  onAnswerClick={handleAnswerClick}
                  onEditClick={setEditTarget}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="answered" className="space-y-3 pt-4">
            {closedNotes.length === 0 ? (
              <EmptyState message="Answered notes and instructions from your pediatrician will appear here." />
            ) : (
              closedNotes.map((n) => (
                <NoteCard
                  key={n.id}
                  note={n}
                  onAnswerClick={handleAnswerClick}
                  onEditClick={setEditTarget}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* ── Add new note modal ─────────────────────────────────────────────── */}
      <PedNoteModal
        open={addOpen}
        babyId={baby?.id ?? ''}
        defaultType="question"
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          setAddOpen(false)
          fetchNotes()
        }}
      />

      {/* ── Edit note modal ────────────────────────────────────────────────── */}
      <PedNoteModal
        open={!!editTarget}
        babyId={baby?.id ?? ''}
        initialData={editTarget ?? undefined}
        onClose={() => setEditTarget(null)}
        onSaved={() => {
          setEditTarget(null)
          fetchNotes()
        }}
      />

      {/* ── Answer recording sheet ─────────────────────────────────────────── */}
      <Sheet open={!!answerTarget} onOpenChange={(v) => !v && setAnswerTarget(null)}>
        <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Record answer</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 pt-4">
            {/* Show the original question/note for context */}
            {answerTarget && (
              <div className="rounded-lg bg-muted px-3 py-2.5 text-sm">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {TYPE_META[answerTarget.type].label}
                </p>
                <p>{answerTarget.content}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Pediatrician&apos;s answer</Label>
              <Textarea
                placeholder="e.g. Normal at this stage — continue current feeding schedule."
                rows={4}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                autoFocus
              />
            </div>

            <Button
              className="w-full h-12 text-base"
              onClick={saveAnswer}
              disabled={saving || !answerText.trim()}
            >
              {saving ? 'Saving…' : 'Save answer'}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={openEditFromAnswerSheet}
            >
              Edit full note
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
