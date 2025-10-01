import { polarToCartesian } from "~/utils/polar-to-cartesian";

/**
 * Create SVG path data for a pie chart arc
 */
export function createArcPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  isHovered: boolean,
) {
  // Add expansion for hovered sector
  const effectiveRadius = isHovered ? radius * 1.15 : radius;

  const start = polarToCartesian(centerX, centerY, effectiveRadius, endAngle);
  const end = polarToCartesian(centerX, centerY, effectiveRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${effectiveRadius} ${effectiveRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}
