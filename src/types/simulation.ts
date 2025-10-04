import type { SimulationNodeDatum } from "d3";

/**
 * Custom simulation node extending D3's SimulationNodeDatum
 * D3 will mutate these objects to add x, y, vx, vy properties
 */
export interface SimulationNode extends SimulationNodeDatum {
  id: string;
  type: "root" | "stack";
  name: string;
  radius: number;
  iconKey?: string;
  color?: string;
}

/**
 * Layout dimensions for the visualization
 */
export interface Dimensions {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  rootRadius: number;
  stackRadius: number;
}
