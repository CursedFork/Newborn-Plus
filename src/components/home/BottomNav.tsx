'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, Clock, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/home',    icon: Home,        label: 'Home'    },
  { href: '/trends',  icon: TrendingUp,  label: 'Trends'  },
  { href: '/history', icon: Clock,       label: 'History' },
  { href: '/export',  icon: FileText,    label: 'Export'  },
  { href: '/settings',icon: Settings,    label: 'Settings'},
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors min-h-[60px] justify-center',
                active
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
