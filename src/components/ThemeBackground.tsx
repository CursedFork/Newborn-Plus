'use client'

import dynamic from 'next/dynamic'
import { useAppearance } from '@/contexts/AppearanceContext'

const THEMES = {
  whimsical: dynamic(() => import('@/components/themes/WhimsicalGarden')),
  botanical: dynamic(() => import('@/components/themes/ClassicalBotanical')),
  abstract: dynamic(() => import('@/components/themes/AbstractWaves')),
  doodle: dynamic(() => import('@/components/themes/KidsDoodle')),
  starry: dynamic(() => import('@/components/themes/StarryNight')),
}

export default function ThemeBackground() {
  const { bgTheme } = useAppearance()
  if (bgTheme === 'none') return null

  const ThemeComponent = THEMES[bgTheme as keyof typeof THEMES]
  if (!ThemeComponent) return null

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <ThemeComponent />
      {/* Dark mode overlay: dims the theme art in dark mode */}
      <div className="absolute inset-0 dark:bg-black/55" />
    </div>
  )
}
