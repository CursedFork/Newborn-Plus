/** Volume unit conversion helpers. Data is always stored in ml. */

export const ML_PER_OZ = 29.5735296

export type VolumeUnit = 'ml' | 'oz'

/**
 * Format a ml value for display in the user's preferred unit.
 * e.g. formatVolume(90, 'ml') → "90 ml"
 *      formatVolume(90, 'oz') → "3.0 oz"
 */
export function formatVolume(ml: number, unit: VolumeUnit): string {
  if (unit === 'oz') return `${(ml / ML_PER_OZ).toFixed(1)} oz`
  return `${Math.round(ml)} ml`
}

/** Convert oz input value back to ml for storage. */
export function ozToMl(oz: number): number {
  return oz * ML_PER_OZ
}

/** Convert ml to oz for display. */
export function mlToOz(ml: number): number {
  return ml / ML_PER_OZ
}
