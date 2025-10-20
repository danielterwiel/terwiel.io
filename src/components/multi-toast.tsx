"use client";

import { X } from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ToastItem } from "~/hooks/use-toast-queue";

const DEFAULT_DURATION = 6000;

interface MultiToastProps {
  toastItem: ToastItem;
  index: number;
  totalToasts: number;
  onDismiss: (id: string) => void;
  style?: React.CSSProperties;
}

/**
 * Individual toast component with stacking depth effect
 * Each toast shows with a slight offset and scale based on its position in the stack
 */
export const MultiToast: React.FC<MultiToastProps> = ({
  toastItem,
  onDismiss,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimeRef = useRef(0);
  const hoverTimeRef = useRef(0);

  const handleDismiss = useCallback(() => {
    setIsDismissing(true);
    // Wait for animation to complete before closing
    setTimeout(() => {
      setIsOpen(false);
      onDismiss(toastItem.id);
    }, 400);
  }, [toastItem.id, onDismiss]);

  const startTimer = useCallback(
    (remainingTime: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, remainingTime);
    },
    [handleDismiss],
  );

  useEffect(() => {
    // Auto-dismiss after duration, with pause/resume support
    if (!isHovering) {
      const remainingTime = DEFAULT_DURATION - elapsedTimeRef.current;
      startTimer(remainingTime);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isHovering, startTimer]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    hoverTimeRef.current = Date.now();
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const hoverDuration = Date.now() - hoverTimeRef.current;
    elapsedTimeRef.current += hoverDuration;
    setIsHovering(false);
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="alert"
      className={`multi-toast pointer-events-auto flex items-start gap-3 rounded-lg border-2 border-klein bg-white p-4 shadow-lg transition-all duration-300 ${
        isDismissing ? "toast-dismiss" : "toast-appear"
      }`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold text-klein">{toastItem.message}</p>
        {toastItem.details && (
          <p className="mt-1 text-xs text-klein/70">{toastItem.details}</p>
        )}
      </div>

      {toastItem.dismissable && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close notification"
          className="relative h-6 w-6 flex-shrink-0 cursor-pointer text-klein/50 transition-colors hover:text-klein focus-visible:text-klein focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-klein"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
};
