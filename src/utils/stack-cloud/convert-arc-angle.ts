import { ARC_TO_MATH_ANGLE_OFFSET } from "~/constants/stack-cloud-physics";

/**
 * Convert d3.arc() angle to Math trigonometry angle
 *
 * d3.arc() coordinate system:
 * - 0 radians = 12 o'clock (top)
 * - π/2 radians = 3 o'clock (right)
 * - π radians = 6 o'clock (bottom)
 * - 3π/2 radians = 9 o'clock (left)
 *
 * Math coordinate system:
 * - 0 radians = 3 o'clock (right)
 * - π/2 radians = 6 o'clock (bottom)
 * - π radians = 9 o'clock (left)
 * - 3π/2 radians = 12 o'clock (top)
 *
 * @param arcAngle - Angle in d3.arc() coordinate system
 * @returns Angle in Math coordinate system
 */
export function arcAngleToMathAngle(arcAngle: number): number {
  return arcAngle - ARC_TO_MATH_ANGLE_OFFSET;
}
