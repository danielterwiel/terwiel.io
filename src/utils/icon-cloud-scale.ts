export const EXPERIENCE_NODE_SCALE_LEVEL = 11; // Scale level 11 (3.75x) - 25% larger than level 10 for prominent display

export function getScaleFactor(scaleLevel: number): number {
  // Level 11 is special: 25% larger than level 10
  if (scaleLevel === 11) return 3.0 * 1.25;
  return 1.0 + ((scaleLevel - 1) / 9) * 2.0;
}
