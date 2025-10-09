import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const isRenderingOnServer = typeof window === "undefined";

const getInitialState = () => {
  return isRenderingOnServer ? false : window.matchMedia(QUERY).matches;
};

/**
 * React hook to detect if the user has enabled reduced motion preference
 * Returns true if user prefers reduced motion
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState(getInitialState);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", listener);
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(listener);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", listener);
      } else {
        mediaQueryList.removeListener(listener);
      }
    };
  }, []);

  return prefersReducedMotion;
}
