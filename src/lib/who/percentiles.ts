// WHO Child Growth Standards — Weight-for-age, boys, birth to 13 weeks
// Source: WHO (2006). WHO Child Growth Standards. Geneva.
// Values in kg at each completed week of age.
// Percentiles: P3, P50, P97

export interface PercentileRow {
  week: number   // completed weeks of age
  p3: number     // kg
  p50: number    // kg
  p97: number    // kg
}

// Boys weight-for-age (kg), birth–13 weeks
export const WHO_MALE_WEIGHT: PercentileRow[] = [
  { week: 0,  p3: 2.46, p50: 3.35, p97: 4.34 },
  { week: 1,  p3: 2.36, p50: 3.27, p97: 4.25 },
  { week: 2,  p3: 2.54, p50: 3.47, p97: 4.49 },
  { week: 3,  p3: 2.76, p50: 3.72, p97: 4.79 },
  { week: 4,  p3: 2.99, p50: 4.00, p97: 5.12 },
  { week: 5,  p3: 3.22, p50: 4.27, p97: 5.44 },
  { week: 6,  p3: 3.45, p50: 4.53, p97: 5.75 },
  { week: 7,  p3: 3.66, p50: 4.78, p97: 6.04 },
  { week: 8,  p3: 3.87, p50: 5.02, p97: 6.32 },
  { week: 9,  p3: 4.06, p50: 5.24, p97: 6.58 },
  { week: 10, p3: 4.23, p50: 5.44, p97: 6.82 },
  { week: 11, p3: 4.39, p50: 5.63, p97: 7.05 },
  { week: 12, p3: 4.53, p50: 5.80, p97: 7.26 },
  { week: 13, p3: 4.66, p50: 5.97, p97: 7.45 },
]

// Girls weight-for-age (kg), birth–13 weeks (included for future multi-sex support)
export const WHO_FEMALE_WEIGHT: PercentileRow[] = [
  { week: 0,  p3: 2.36, p50: 3.23, p97: 4.18 },
  { week: 1,  p3: 2.26, p50: 3.14, p97: 4.07 },
  { week: 2,  p3: 2.41, p50: 3.31, p97: 4.27 },
  { week: 3,  p3: 2.60, p50: 3.53, p97: 4.53 },
  { week: 4,  p3: 2.79, p50: 3.76, p97: 4.80 },
  { week: 5,  p3: 2.98, p50: 3.99, p97: 5.07 },
  { week: 6,  p3: 3.17, p50: 4.22, p97: 5.33 },
  { week: 7,  p3: 3.35, p50: 4.44, p97: 5.58 },
  { week: 8,  p3: 3.52, p50: 4.65, p97: 5.82 },
  { week: 9,  p3: 3.68, p50: 4.84, p97: 6.04 },
  { week: 10, p3: 3.83, p50: 5.02, p97: 6.24 },
  { week: 11, p3: 3.97, p50: 5.19, p97: 6.43 },
  { week: 12, p3: 4.10, p50: 5.35, p97: 6.60 },
  { week: 13, p3: 4.21, p50: 5.49, p97: 6.77 },
]

export function getPercentileTable(sex: 'male' | 'female' | 'unspecified'): PercentileRow[] {
  return sex === 'female' ? WHO_FEMALE_WEIGHT : WHO_MALE_WEIGHT
}

/** Convert ounces to kg */
export function ozToKg(oz: number): number {
  return oz * 0.0283495
}

/** Convert kg to ounces */
export function kgToOz(kg: number): number {
  return kg / 0.0283495
}

/** Format ounces as "X lb Y oz" */
export function formatOz(oz: number): string {
  const lb = Math.floor(oz / 16)
  const remainingOz = Math.round((oz % 16) * 10) / 10
  return `${lb} lb ${remainingOz} oz`
}

/** Age in completed weeks given birth date */
export function ageInWeeks(birthDate: Date, measureDate: Date): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  return Math.floor((measureDate.getTime() - birthDate.getTime()) / msPerWeek)
}
