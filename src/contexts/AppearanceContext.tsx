'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type BgTheme = 'none' | 'whimsical' | 'botanical' | 'abstract' | 'doodle' | 'starry'

interface AppearanceContextValue {
  bgTheme: BgTheme
  setBgTheme: (t: BgTheme) => void
}

const AppearanceContext = createContext<AppearanceContextValue>({
  bgTheme: 'none',
  setBgTheme: () => {},
})

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [bgTheme, setBgThemeState] = useState<BgTheme>('none')

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('bg-theme') as BgTheme | null
    if (stored && stored !== 'none') setBgThemeState(stored)
  }, [])

  // Toggle the has-theme class so globals.css can make the body transparent
  useEffect(() => {
    const root = document.documentElement
    if (bgTheme !== 'none') {
      root.classList.add('has-theme')
    } else {
      root.classList.remove('has-theme')
    }
  }, [bgTheme])

  function setBgTheme(t: BgTheme) {
    setBgThemeState(t)
    localStorage.setItem('bg-theme', t)
  }

  return (
    <AppearanceContext.Provider value={{ bgTheme, setBgTheme }}>
      {children}
    </AppearanceContext.Provider>
  )
}

export function useAppearance() {
  return useContext(AppearanceContext)
}
