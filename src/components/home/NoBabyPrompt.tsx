'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export function NoBabyPrompt() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">Welcome to Newborn+</h1>
      <p className="text-muted-foreground">Set up your baby&apos;s profile to start logging.</p>
      <Link href="/settings/baby/new" className={buttonVariants({ size: 'lg' })}>
        Create profile
      </Link>
    </div>
  )
}
