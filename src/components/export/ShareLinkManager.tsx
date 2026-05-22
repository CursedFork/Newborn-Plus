'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ShareLinkRow } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Copy, Trash2, Plus } from 'lucide-react'

interface Props {
  babyId: string
  userId: string
  role: string
}

export default function ShareLinkManager({ babyId, userId, role }: Props) {
  const supabase = createClient()
  const [links, setLinks] = useState<ShareLinkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [label, setLabel] = useState('')
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [showForm, setShowForm] = useState(false)

  const isOwner = role === 'owner'

  async function loadLinks() {
    const { data } = await supabase
      .from('share_links')
      .select('*')
      .eq('baby_id', babyId)
      .is('revoked_at', null)
      .order('created_at', { ascending: false })
    setLinks((data as ShareLinkRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { loadLinks() }, [babyId])

  async function createLink() {
    setCreating(true)
    const expiresAt = expiresInDays
      ? new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000).toISOString()
      : null
    const { error } = await supabase.from('share_links').insert({
      baby_id: babyId,
      created_by: userId,
      label: label || null,
      date_range_start: dateStart || null,
      date_range_end: dateEnd || null,
      expires_at: expiresAt,
    })
    setCreating(false)
    if (error) { toast.error(error.message); return }
    toast.success('Share link created')
    setShowForm(false)
    setLabel(''); setExpiresInDays(''); setDateStart(''); setDateEnd('')
    loadLinks()
  }

  async function revokeLink(id: string) {
    await supabase.from('share_links').update({ revoked_at: new Date().toISOString() }).eq('id', id)
    toast.success('Link revoked')
    loadLinks()
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/share/${token}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  function isExpired(link: ShareLinkRow) {
    return link.expires_at ? new Date(link.expires_at) < new Date() : false
  }

  if (loading) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Share links</h3>
        {isOwner && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New link
          </Button>
        )}
      </div>

      {showForm && isOwner && (
        <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/20">
          <div className="space-y-2">
            <Label>Label (optional)</Label>
            <Input placeholder="e.g. Dr. Smith visit" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date range start</Label>
              <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date range end</Label>
              <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Expires in (days, leave blank = never)</Label>
            <Input
              type="number"
              placeholder="e.g. 30"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : '')}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={createLink} disabled={creating} size="sm">
              {creating ? 'Creating…' : 'Create link'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {links.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active share links.</p>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div key={link.id} className="border border-border rounded-lg p-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {link.label && <span className="text-sm font-medium">{link.label}</span>}
                  {isExpired(link) && <Badge variant="destructive">Expired</Badge>}
                  {link.expires_at && !isExpired(link) && (
                    <Badge variant="secondary">
                      Expires {new Date(link.expires_at).toLocaleDateString()}
                    </Badge>
                  )}
                  {(link.date_range_start || link.date_range_end) && (
                    <Badge variant="outline">
                      {link.date_range_start ?? '…'} – {link.date_range_end ?? '…'}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Viewed {link.view_count} time{link.view_count !== 1 ? 's' : ''}
                  {link.last_viewed_at ? ` · Last: ${new Date(link.last_viewed_at).toLocaleDateString()}` : ''}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyLink(link.token)} title="Copy link">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                {isOwner && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => revokeLink(link.id)} title="Revoke">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
