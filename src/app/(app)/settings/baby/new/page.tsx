'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { BabySex } from '@/lib/database.types'

export default function NewBabyPage() {
  const supabase = createClient()
  const router = useRouter()

  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sex, setSex] = useState<BabySex>('unspecified')
  const [birthWeightLb, setBirthWeightLb] = useState('')
  const [birthWeightOz, setBirthWeightOz] = useState('')
  const [saving, setSaving] = useState(false)

  const totalBirthOz =
    (parseFloat(birthWeightLb || '0') * 16) + parseFloat(birthWeightOz || '0')

  async function save() {
    if (!name.trim() || !birthDate) {
      toast.error('Name and birth date are required')
      return
    }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Not signed in'); setSaving(false); return }

    // Generate the ID client-side so we can create the caregiver in the next
    // step without needing to read the baby row back (which would fail RLS
    // because no caregiver exists yet).
    const babyId = crypto.randomUUID()

    const { error: babyError } = await supabase
      .from('babies')
      .insert({
        id: babyId,
        name: name.trim(),
        birth_date: birthDate,
        sex,
        birth_weight_oz: totalBirthOz > 0 ? totalBirthOz : null,
      })

    if (babyError) { toast.error(babyError.message); setSaving(false); return }

    const { error: cgError } = await supabase.from('caregivers').insert({
      baby_id: babyId,
      user_id: user.id,
      role: 'owner',
      display_name: user.email?.split('@')[0] ?? 'Owner',
    })

    setSaving(false)
    if (cgError) { toast.error(cgError.message); return }
    toast.success(`${name} profile created!`)
    router.push('/home')
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create baby profile</h1>
        <p className="text-muted-foreground text-sm mt-1">You can edit all of this later.</p>
      </div>

      <div className="space-y-2">
        <Label>Baby's name</Label>
        <Input placeholder="e.g. Baby" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Date of birth</Label>
        <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Sex</Label>
        <Select value={sex} onValueChange={(v) => v != null && setSex(v as BabySex)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="unspecified">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Birth weight (optional)</Label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input type="number" placeholder="0" min={0} value={birthWeightLb} onChange={(e) => setBirthWeightLb(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1 text-center">lb</p>
          </div>
          <div className="flex-1">
            <Input type="number" placeholder="0" min={0} max={15.9} step={0.1} value={birthWeightOz} onChange={(e) => setBirthWeightOz(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1 text-center">oz</p>
          </div>
        </div>
      </div>

      <Button className="w-full h-14 text-base" onClick={save} disabled={saving}>
        {saving ? 'Creating…' : 'Create profile'}
      </Button>
    </div>
  )
}
