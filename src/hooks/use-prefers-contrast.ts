import { useEffect, useState } from "react";

const QUERY = "(prefers-contrast: more)";

const isRenderingOnServer = typeof window === "undefined";

const getInitialState = () => {
  return isRenderingOnServer ? false : window.matchMedia(QUERY).matches;
};

/**
 * React hook to detect if the user has enabled increased contrast preference
 * Returns true if user prefers more contrast
 */
export function usePrefersContrast() {
  const [prefersContrast, setPrefersContrast] = useState(getInitialState);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersContrast(event.matches);
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

  return prefersContrast;
}
