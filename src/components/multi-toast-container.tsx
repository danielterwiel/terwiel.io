"use client";

import { useState } from "react";

import { useToasts } from "~/hooks/use-toasts";
import { MultiToast } from "./multi-toast";

/**
 * Multi-toast container that displays multiple toasts with stacking depth effect
 * Uses CSS variables and z-index for proper stacking
 * Supports pyramid effect when hovering: toasts spread to show all items
 * Should be placed inside ToastContextProvider
 */
export const MultiToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToasts();
  const [hoveredToastId, setHoveredToastId] = useState<string | null>(null);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50">
      <div className="multi-toast-stack-container">
        {toasts.map((toast, index) => {
          const isHovered = hoveredToastId === toast.id;
          const hoveredIndex = hoveredToastId
            ? toasts.findIndex((t) => t.id === hoveredToastId)
            : -1;
          // Normal order: most recent toast (highest index) appears at top
          // Older toasts are positioned below in the stack
          // During hover, pyramid effect uses distance from hovered toast
          const positionIndex = index;
          const positionHoveredIndex = hoveredToastId
            ? toasts.findIndex((t) => t.id === hoveredToastId)
            : -1;
          const zIndexDuringHover = hoveredToastId
            ? Math.max(
                1,
                500 - Math.abs(positionIndex - positionHoveredIndex) * 100,
              )
            : index + 1;
          // Distance from hovered toast for depth scaling
          const distanceFromHovered =
            hoveredToastId !== null
              ? Math.abs(positionIndex - positionHoveredIndex)
              : 0;

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
              data-toast-index={index}
              data-hovered-index={hoveredIndex}
              data-distance-from-hovered={distanceFromHovered}
              style={
                {
                  "--toast-index": index,
                  "--total-toasts": toasts.length,
                  "--hovered-index": hoveredIndex,
                  "--z-index-during-hover": zIndexDuringHover,
                  "--distance-from-hovered": distanceFromHovered,
                } as React.CSSProperties & {
                  "--toast-index": number;
                  "--total-toasts": number;
                  "--hovered-index": number;
                  "--z-index-during-hover": number;
                  "--distance-from-hovered": number;
                }
              }
            />
          );
        })}
      </div>
    </div>
  );
};
