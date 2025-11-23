import type { Domain } from "~/types";

export type Oklch = { l: number; c: number; h: number };

// Matrix types for 3x3 matrices and 3D vectors
type Matrix3x3 = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];
type Vec3 = readonly [number, number, number];

/**
 * Convert OKLCH object to CSS oklch() string
 */
export const toOklchString = (color: Oklch): string => {
  return `oklch(${(color.l * 100).toFixed(2)}% ${color.c.toFixed(4)} ${color.h.toFixed(2)})`;
};

/**
 * Matrix multiplication helper
 */
const multiplyMatrices = (A: Matrix3x3, B: Vec3): Vec3 => {
  return [
    A[0] * B[0] + A[1] * B[1] + A[2] * B[2],
    A[3] * B[0] + A[4] * B[1] + A[5] * B[2],
    A[6] * B[0] + A[7] * B[1] + A[8] * B[2],
  ];
};

/**
 * Convert OKLCH to OKLAB
 */
const oklchToOklab = (l: number, c: number, h: number): Vec3 => {
  const hRad = (h * Math.PI) / 180;
  return [l, c * Math.cos(hRad), c * Math.sin(hRad)];
};

/**
 * Convert OKLAB to linear RGB
 */
const oklabToLinearRgb = (lab: Vec3): Vec3 => {
  // OKLAB to LMS (cone response)
  const lmsMatrix: Matrix3x3 = [
    1, 0.3963377773761749, 0.2158037573099136, 1, -0.1055613458156586,
    -0.0638541728258133, 1, -0.0894841775298119, -1.2914855480194092,
  ];
  const lms = multiplyMatrices(lmsMatrix, lab);

  // Cube LMS values
  const lmsCubed: Vec3 = [lms[0] ** 3, lms[1] ** 3, lms[2] ** 3];

  // LMS to XYZ
  const lmsToXyzMatrix: Matrix3x3 = [
    1.2268798758459243, -0.5578149944602171, 0.2813910456659647,
    -0.0405757452148008, 1.112286803280317, -0.0717110580655164,
    -0.0763729366746601, -0.4214933324022432, 1.5869240198367816,
  ];
  const xyz = multiplyMatrices(lmsToXyzMatrix, lmsCubed);

  // XYZ to linear RGB
  const xyzToRgbMatrix: Matrix3x3 = [
    3.2409699419045226, -1.537383177570094, -0.4986107602930034,
    -0.9692436362808796, 1.8759675015077202, 0.04155505740717559,
    0.05563007969699366, -0.20397695888897652, 1.0569715142428786,
  ];
  return multiplyMatrices(xyzToRgbMatrix, xyz);
};

/**
 * Convert linear RGB to sRGB (gamma correction)
 */
const linearRgbToSrgb = (rgb: Vec3): Vec3 => {
  const convert = (val: number) => {
    const abs = Math.abs(val);
    if (abs > 0.0031308) {
      return (val < 0 ? -1 : 1) * (1.055 * abs ** (1 / 2.4) - 0.055);
    }
    return 12.92 * val;
  };
  return [convert(rgb[0]), convert(rgb[1]), convert(rgb[2])];
};

/**
 * Convert OKLCH to hex color
 * Uses proper color space transformations: OKLCH → OKLAB → Linear RGB → sRGB → Hex
 */
export const oklchToHex = (color: Oklch): string => {
  const { l, c, h } = color;

  // OKLCH → OKLAB
  const oklab = oklchToOklab(l, c, h);

  // OKLAB → Linear RGB
  const linearRgb = oklabToLinearRgb(oklab);

  // Linear RGB → sRGB (gamma correction)
  const srgb = linearRgbToSrgb(linearRgb);

  // Clamp and convert to 0-255
  const clamp = (val: number) =>
    Math.max(0, Math.min(255, Math.round(val * 255)));

  const toHex = (val: number) => clamp(val).toString(16).padStart(2, "0");

  return `#${toHex(srgb[0])}${toHex(srgb[1])}${toHex(srgb[2])}`;
};

/**
 * Create a subtle border version of a color
 * Makes it very light and desaturated for default borders
 * For highly saturated colors (c > 0.25), reduce chroma more aggressively
 */
export const toSubtleBorder = (color: Oklch): string => {
  const subtleColor = {
    ...color,
    l: 0.92, // Very light for subtle appearance
    c: Math.max(0.015, color.c * 0.08), // Heavily desaturated (8% of original)
  };
  return toOklchString(subtleColor);
};

/**
 * Create a high-contrast version by darkening
 * Useful for better visibility on light backgrounds
 * For already saturated colors, maintain chroma and reduce lightness more
 */
export const toHighContrast = (color: Oklch): string => {
  const highContrastColor = {
    ...color,
    l: Math.max(0.4, color.l - 0.25), // Darken by 25%, minimum 40% lightness
    c: color.c * 0.95, // Slightly reduce chroma for better contrast
  };
  return toOklchString(highContrastColor);
};

/**
 * Create a segment outline color - darker and more saturated for visual pop
 * Used for stroke outlines on selected segment donut rings
 * Maintains color harmony while ensuring 3:1 contrast minimum
 */
export const toSegmentOutline = (color: Oklch): Oklch => {
  return {
    ...color,
    l: Math.max(0.45, color.l - 0.18), // Darken moderately (less than high-contrast)
    c: Math.min(0.25, color.c * 1.4), // Boost saturation by 40%, cap at 0.25
  };
};

/**
 * Generate all domain color variations from OKLCH definitions
 */
export const generateDomainColors = (domainColors: Record<Domain, Oklch>) => {
  const domains = Object.keys(domainColors) as Domain[];

  const colors = {} as Record<Domain, string>;
  const colorsHex = {} as Record<Domain, string>;
  const bordersSubtle = {} as Record<Domain, string>;
  const bordersSubtleHex = {} as Record<Domain, string>;
  const highContrast = {} as Record<Domain, string>;
  const highContrastHex = {} as Record<Domain, string>;

  for (const domain of domains) {
    const color = domainColors[domain];
    if (!color) continue;

    colors[domain] = toOklchString(color);
    colorsHex[domain] = oklchToHex(color);
    bordersSubtle[domain] = toSubtleBorder(color);
    bordersSubtleHex[domain] = oklchToHex({
      ...color,
      l: 0.92,
      c: Math.max(0.015, color.c * 0.08),
    });
    highContrast[domain] = toHighContrast(color);
    highContrastHex[domain] = oklchToHex({
      ...color,
      l: Math.max(0.4, color.l - 0.25),
      c: color.c * 0.95,
    });
  }

  return {
    colors,
    colorsHex,
    bordersSubtle,
    bordersSubtleHex,
    highContrast,
    highContrastHex,
  };
};
