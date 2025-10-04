/**
 * Clamps a value between a minimum and maximum
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
