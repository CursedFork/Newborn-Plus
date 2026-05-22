'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'
import Link from 'next/link'

export default function SettingsPage() {
  return (
    <div className="p-4 pt-6 space-y-4 max-w-md">
      <h1 className="text-xl font-bold">Settings</h1>
      <Link href="/settings/baby/new" className={buttonVariants({ variant: 'outline' })}>
        Add / change baby
      </Link>
      <form action={signOut}>
        <Button type="submit" variant="destructive" className="w-full">Sign out</Button>
      </form>
    </div>
  )
}
