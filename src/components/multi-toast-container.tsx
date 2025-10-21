"use client";

import { useState } from "react";

import { useToasts } from "~/hooks/use-toasts";
import { MultiToast } from "./multi-toast";

const TOAST_HEIGHT = 60; // px - approximate height of each toast
const TOAST_GAP = 12; // px - gap between toasts when expanded
const PEEK_HEIGHT = 16; // px - how much to show when accordion stacked

/**
 * Multi-toast container with clean stacking implementation
 * Based on web.dev research: position absolute + simple z-index + transform positioning
 * When hovered, recalculates all toast positions to expand/collapse them
 * This avoids complex stacking context issues by keeping transforms simple
 */
export const MultiToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToasts();
  const [hoveredToastId, setHoveredToastId] = useState<string | null>(null);

  const hoveredIndex = hoveredToastId
    ? toasts.findIndex((t) => t.id === hoveredToastId)
    : -1;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50">
      <div className="multi-toast-stack-container">
        {toasts.map((toast, index) => {
          const isHovered = hoveredToastId === toast.id;

          // Determine the "front" toast: either hovered or most recent (index 0)
          const frontIndex =
            hoveredToastId !== null && hoveredIndex >= 0 ? hoveredIndex : 0;

          // Distance from the front toast
          const distanceFromFront = Math.abs(index - frontIndex);

          // Z-index: when hovering, use distance-based ordering
          // Closer to hovered toast = higher z-index (on top)
          // This creates proper pyramid effect both above and below
          let zIndex: number;
          if (hoveredToastId !== null && hoveredIndex >= 0) {
            // During hover: closer toasts appear on top
            // Use distance as primary sort, index as tiebreaker
            // Newer toasts (higher index) win when distance is equal
            zIndex = 10000 - distanceFromFront * 100 + index;
          } else {
            // Default state: newer toasts (higher index) on top
            zIndex = toasts.length - index;
          }

          // Cumulative depth scale: based on distance from front toast
          // Front toast: 100%, each distance level: 3% smaller (200% more aggressive)
          // Distance 1: 97%, Distance 2: 94%, Distance 3: 91%, etc.
          const depthScale = 1.0 - distanceFromFront * 0.03;

          // When hovering a toast, calculate translateY to expand/collapse stack
          // With overflow: hidden on container, this shows just peek slices above/below
          let translateYValue = 0;
          if (hoveredToastId !== null && hoveredIndex >= 0) {
            // Distance-based movement with peek slices
            // Each distance level: move by (TOAST_HEIGHT - PEEK_HEIGHT + GAP)
            // This allows peeking but keeps distance growing
            const movePerDistance = TOAST_HEIGHT - PEEK_HEIGHT + TOAST_GAP;

            if (index < hoveredIndex) {
              // Toasts above hovered: push them UP
              // Negative = up, showing bottom slice when clipped
              translateYValue = -(hoveredIndex - index) * movePerDistance;
            } else if (index > hoveredIndex) {
              // Toasts below hovered: push them DOWN
              // Positive = down, showing top slice when clipped
              translateYValue = (index - hoveredIndex) * movePerDistance;
            }
            // Hovered toast stays at translateY: 0
          }

          return (
            <MultiToast
              key={toast.id}
              toastItem={toast}
              index={index}
              totalToasts={toasts.length}
              onDismiss={removeToast}
              isHovered={isHovered}
              hoveredToastIndex={hoveredIndex}
              onMouseEnter={() => setHoveredToastId(toast.id)}
              onMouseLeave={() => setHoveredToastId(null)}
              style={
                {
                  "--toast-index": index,
                  "--z-index": zIndex.toString(),
                  "--translate-y": `${translateYValue}px`,
                  transform: `translateY(${translateYValue}px)`,
                  maxWidth: `${depthScale * 100}%`,
                } as React.CSSProperties & {
                  "--toast-index": number;
                  "--z-index": string;
                  "--translate-y": string;
                }
              }
              data-toast-index={index}
            />
          );
        })}
      </div>
    </div>
  );
};
