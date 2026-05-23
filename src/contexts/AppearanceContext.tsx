'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { VolumeUnit } from '@/lib/units'

export type BgTheme = 'none' | 'whimsical' | 'botanical' | 'abstract' | 'doodle' | 'starry'

interface AppearanceContextValue {
  bgTheme: BgTheme
  setBgTheme: (t: BgTheme) => void
  volumeUnit: VolumeUnit
  setVolumeUnit: (u: VolumeUnit) => void
}

const AppearanceContext = createContext<AppearanceContextValue>({
  bgTheme: 'none',
  setBgTheme: () => {},
  volumeUnit: 'ml',
  setVolumeUnit: () => {},
})

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [bgTheme, setBgThemeState] = useState<BgTheme>('none')
  const [volumeUnit, setVolumeUnitState] = useState<VolumeUnit>('ml')

  // Load persisted preferences on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('bg-theme') as BgTheme | null
    if (storedTheme) setBgThemeState(storedTheme)

    const storedUnit = localStorage.getItem('volume-unit') as VolumeUnit | null
    if (storedUnit === 'ml' || storedUnit === 'oz') setVolumeUnitState(storedUnit)
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

  function setVolumeUnit(u: VolumeUnit) {
    setVolumeUnitState(u)
    localStorage.setItem('volume-unit', u)
  }

  return (
    <AppearanceContext.Provider value={{ bgTheme, setBgTheme, volumeUnit, setVolumeUnit }}>
      {children}
    </AppearanceContext.Provider>
  )
}

export function useAppearance() {
  return useContext(AppearanceContext)
}
