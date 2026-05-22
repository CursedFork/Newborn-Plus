'use client'

import { useTheme } from 'next-themes'
import { useAppearance, type BgTheme } from '@/contexts/AppearanceContext'
import { Button, buttonVariants } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const THEME_OPTIONS: {
  id: BgTheme
  label: string
  emoji: string
  colors: string[]
}[] = [
  { id: 'none',      label: 'None',      emoji: '⬜',  colors: ['#ffffff', '#f3f4f6'] },
  { id: 'whimsical', label: 'Whimsical', emoji: '🌸',  colors: ['#76C8ED', '#8BC975', '#FADA5E'] },
  { id: 'botanical', label: 'Botanical', emoji: '🦚',  colors: ['#F9F5EE', '#8AAA78', '#B8CDD8'] },
  { id: 'abstract',  label: 'Abstract',  emoji: '🎨',  colors: ['#FEFAEF', '#F97316', '#0D9488'] },
  { id: 'doodle',    label: 'Doodle',    emoji: '🌈',  colors: ['#ffffff', '#FF6B6B', '#4ECDC4'] },
  { id: 'starry',    label: 'Starry',    emoji: '🌙',  colors: ['#06082A', '#0D1145', '#FFD88A'] },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { bgTheme, setBgTheme } = useAppearance()

  return (
    <div className="p-4 pt-6 space-y-8 max-w-md">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* ── Appearance ───────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Appearance
        </h2>

        {/* Dark / Light / System */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Color mode</p>
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  'rounded-lg border-2 py-3 text-sm font-medium capitalize transition-colors',
                  theme === t
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-card-foreground hover:bg-muted'
                )}
              >
                {t === 'light' ? '☀️ Light' : t === 'dark' ? '🌙 Dark' : '🖥 System'}
              </button>
            ))}
          </div>
        </div>

        {/* Background theme picker */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Background theme</p>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ id, label, emoji, colors }) => {
              const selected = bgTheme === id
              return (
                <button
                  key={id}
                  onClick={() => setBgTheme(id)}
                  className={cn(
                    'group rounded-lg border-2 p-2 flex flex-col items-center gap-1.5 transition-colors',
                    selected
                      ? 'border-primary'
                      : 'border-border hover:border-muted-foreground'
                  )}
                >
                  {/* Color swatch */}
                  <div
                    className="w-full h-10 rounded-md overflow-hidden flex"
                    style={{
                      background: colors.length >= 3
                        ? `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`
                        : `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
                    }}
                  />
                  <span className="text-xs font-medium leading-none">{emoji} {label}</span>
                </button>
              )
            })}
          </div>
          {bgTheme !== 'none' && (
            <p className="text-xs text-muted-foreground">
              Background art shows beneath all screens. Dark mode dims it automatically.
            </p>
          )}
        </div>
      </section>

      {/* ── Account ──────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Account
        </h2>
        <Link href="/settings/baby/new" className={buttonVariants({ variant: 'outline' })}>
          Add / change baby
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="destructive" className="w-full">Sign out</Button>
        </form>
      </section>
    </div>
  )
}
