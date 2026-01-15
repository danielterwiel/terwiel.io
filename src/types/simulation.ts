/**
 * Layout dimensions for the visualization
 * Used by both D3 and CSS-based visualizations
 */
export interface Dimensions {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  rootRadius: number;
  stackRadius: number;
}

/**
 * Simulation node interface (for backwards compatibility)
 * No longer extends D3's SimulationNodeDatum since D3 has been removed
 */
export interface SimulationNode {
  id: string;
  type: "root" | "stack";
  name: string;
  radius: number;
  iconKey?: string;
  color?: string;
  scaleFactor?: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  vx?: number;
  vy?: number;
}
