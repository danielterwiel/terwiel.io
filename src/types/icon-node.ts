export type IconNode = {
  id: string;
  name: string;
  icon: string;
  url: string;
  r: number;
  scaleLevel: number; // 1-10 scale level for Tailwind classes
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  group: number;
  isHovered?: boolean;
};
