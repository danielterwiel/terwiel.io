import { useEffect, useState } from "react";

const QUERY = "(forced-colors: active)";

const isRenderingOnServer = typeof window === "undefined";

const getInitialState = () => {
  return isRenderingOnServer ? false : window.matchMedia(QUERY).matches;
};

/**
 * React hook to detect if the user has forced colors mode enabled (Windows High Contrast Mode)
 * Returns true if forced colors mode is active
 */
export function useForcedColors() {
  const [forcedColors, setForcedColors] = useState(getInitialState);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY);

    const listener = (event: MediaQueryListEvent) => {
      setForcedColors(event.matches);
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

  return forcedColors;
}
