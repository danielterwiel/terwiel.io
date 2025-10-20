"use client";

import * as RadixToast from "@radix-ui/react-toast";

import type React from "react";

// Default toast duration in milliseconds (6 seconds for search results)
// Formula: min(max(message.length * 50, 2000), 7000)
const DEFAULT_DURATION = 6000;

/**
 * ToastProvider wraps the application with Radix UI Toast context
 * and provides the toast viewport for displaying toasts.
 *
 * This component should be placed at the root level of your application,
 * typically in the layout.tsx file.
 *
 * Features:
 * - Responsive positioning (bottom-right on mobile and desktop)
 * - Auto-dismiss with configurable duration
 * - Swipe gesture support (right to dismiss on mobile)
 * - Stacking support with view transitions
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <RadixToast.Provider duration={DEFAULT_DURATION} swipeDirection="right">
      {children}
      {/*
        Viewport positioned fixed to allow toasts to appear above all content.
        Positioning: bottom-right on both mobile and desktop (no top-4 on desktop)
        Uses pointer-events-none to prevent interfering with page interactions,
        except for individual toasts which have pointer-events-auto.

        Flex column-reverse allows toasts to stack upward with each new toast
        appearing at the bottom, pushing older toasts up.
      */}
      <RadixToast.Viewport className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 max-w-sm" />
    </RadixToast.Provider>
  );
};
