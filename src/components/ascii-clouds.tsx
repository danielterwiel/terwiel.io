"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * ASCII Clouds Background Component
 *
 * A subtle, performant background effect using ASCII characters to render
 * animated cloud-like patterns. Uses Perlin noise for organic movement.
 *
 * Performance optimizations:
 * - Uses canvas for efficient rendering (no DOM manipulation)
 * - Respects prefers-reduced-motion (static or disabled)
 * - GPU-accelerated via will-change: transform
 * - Cleanup on unmount to prevent memory leaks
 * - Throttled animation via requestAnimationFrame
 *
 * Accessibility:
 * - Purely decorative (aria-hidden="true")
 * - Respects prefers-reduced-motion
 * - Subtle opacity (max 0.08) to not distract
 *
 * @see PRD.md LAYOUT-002 for requirements
 */

// Perlin noise implementation (simplified 2D)
// Based on Ken Perlin's improved noise function
const PERMUTATION = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
  36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234,
  75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237,
  149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48,
  27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105,
  92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73,
  209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86,
  164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38,
  147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189,
  28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101,
  155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
  178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,
  191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
  181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
  138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215,
  61, 156, 180,
];

// Double the permutation table to avoid overflow
const p = [...PERMUTATION, ...PERMUTATION];

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function noise2D(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;

  x -= Math.floor(x);
  y -= Math.floor(y);

  const u = fade(x);
  const v = fade(y);

  // Safe array access - p is 512 elements, X and Y are masked to 255
  const A = (p[X] ?? 0) + Y;
  const B = (p[X + 1] ?? 0) + Y;

  return lerp(
    v,
    lerp(u, grad(p[A] ?? 0, x, y), grad(p[B] ?? 0, x - 1, y)),
    lerp(u, grad(p[A + 1] ?? 0, x, y - 1), grad(p[B + 1] ?? 0, x - 1, y - 1)),
  );
}

// Multi-octave noise for more natural cloud appearance
function fbm(x: number, y: number, octaves = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, y * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value;
}

// ASCII glyphs ordered by visual density (lightest to heaviest)
const GLYPHS = [" ", ".", "-", "+", "o", "O"];

// Thresholds for glyph selection (normalized noise value 0-1)
const THRESHOLDS = [0.3, 0.4, 0.5, 0.6, 0.75];

function getGlyph(value: number): string {
  // Normalize from [-1, 1] to [0, 1]
  const normalized = (value + 1) / 2;

  for (let i = 0; i < THRESHOLDS.length; i++) {
    const threshold = THRESHOLDS[i];
    if (threshold !== undefined && normalized < threshold) {
      return GLYPHS[i] ?? " ";
    }
  }
  return GLYPHS[GLYPHS.length - 1] ?? "O";
}

interface AsciiCloudsProps {
  /** Base opacity of the clouds (default: 0.06) */
  opacity?: number;
  /** Animation speed multiplier (default: 1) */
  speed?: number;
  /** Cell size in pixels (default: 14) */
  cellSize?: number;
}

export function AsciiClouds({
  opacity = 0.06,
  speed = 1,
  cellSize = 14,
}: AsciiCloudsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const render = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { width, height } = canvas;
      const cols = Math.ceil(width / cellSize);
      const rows = Math.ceil(height / cellSize);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Set font style - monospace for consistent character spacing
      ctx.font = `${cellSize * 0.85}px monospace`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      // Klein blue color with configured opacity
      ctx.fillStyle = `oklch(37.85% 0.1954 263.23 / ${opacity})`;

      // Time factor for animation (slow movement)
      const t = prefersReducedMotion ? 0 : time * 0.0001 * speed;

      // Noise scale (larger = bigger clouds)
      const scale = 0.03;

      // Render each cell
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cellSize + cellSize / 2;
          const y = row * cellSize + cellSize / 2;

          // Calculate noise value with slow horizontal drift
          const noiseX = col * scale + t * 0.5;
          const noiseY = row * scale + t * 0.2;

          // Use fractal Brownian motion for organic appearance
          const value = fbm(noiseX, noiseY, 3);
          const glyph = getGlyph(value);

          // Only draw non-space characters
          if (glyph !== " ") {
            ctx.fillText(glyph, x, y);
          }
        }
      }
    },
    [cellSize, opacity, prefersReducedMotion, speed],
  );

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      // Set canvas size accounting for device pixel ratio
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Scale context to handle DPR
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      // Render immediately after resize
      render(performance.now());
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [render]);

  // Animation loop
  useEffect(() => {
    // Static render for reduced motion
    if (prefersReducedMotion) {
      render(0);
      return;
    }

    let lastTime = 0;
    const targetFps = 30; // Target 30fps for subtle animation (saves battery)
    const frameInterval = 1000 / targetFps;

    const animate = (time: number) => {
      animationRef.current = requestAnimationFrame(animate);

      // Throttle to target FPS
      const elapsed = time - lastTime;
      if (elapsed < frameInterval) return;

      lastTime = time - (elapsed % frameInterval);
      render(time);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [prefersReducedMotion, render]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{
        willChange: prefersReducedMotion ? "auto" : "transform",
      }}
    />
  );
}
