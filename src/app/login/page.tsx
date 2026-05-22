'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)

  async function sendMagicLink() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      setMagicSent(true)
    }
  }

  async function signInWithPassword() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) toast.error(error.message)
    // middleware redirects on success
  }

  async function signUpWithPassword() {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Check your email to confirm your account.')
    }
  }

  if (magicSent) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="text-4xl">✉️</div>
          <h1 className="text-xl font-semibold">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            We sent a magic link to <strong>{email}</strong>. Tap it to sign in.
          </p>
          <Button variant="ghost" size="sm" onClick={() => setMagicSent(false)}>
            Use a different method
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Newborn+</h1>
          <p className="text-muted-foreground text-sm">Sign in to continue</p>
        </div>

        <Tabs defaultValue="magic">
          <TabsList className="w-full">
            <TabsTrigger value="magic" className="flex-1">Magic link</TabsTrigger>
            <TabsTrigger value="password" className="flex-1">Password</TabsTrigger>
          </TabsList>

          {/* Magic link tab */}
          <TabsContent value="magic" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email-magic">Email</Label>
              <Input
                id="email-magic"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMagicLink()}
              />
            </div>
            <Button className="w-full" onClick={sendMagicLink} disabled={loading || !email}>
              {loading ? 'Sending…' : 'Send magic link'}
            </Button>
            <p className="text-muted-foreground text-center text-xs">
              No password needed. We'll email you a sign-in link.
            </p>
          </TabsContent>

          {/* Password tab */}
          <TabsContent value="password" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email-pw">Email</Label>
              <Input
                id="email-pw"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && signInWithPassword()}
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={signInWithPassword} disabled={loading || !email || !password}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
              <Button variant="outline" className="flex-1" onClick={signUpWithPassword} disabled={loading || !email || !password}>
                {loading ? '…' : 'Sign up'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
