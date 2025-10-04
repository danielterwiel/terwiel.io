import { useCallback, useEffect, useState } from "react";

import type { Dimensions } from "~/types/simulation";
import { debounce } from "~/utils/debounce";

/**
 * Hook to measure and track container dimensions
 * Handles ResizeObserver and VisualViewport changes (for iOS Safari)
 */
export function useDimensions(
  wrapperRef: React.RefObject<HTMLDivElement | null>,
) {
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  const measureContainer = useCallback((): Dimensions | null => {
    if (!wrapperRef.current) return null;

    const rect = wrapperRef.current.getBoundingClientRect();
    const vmin = Math.min(rect.width, rect.height);

    return {
      width: rect.width,
      height: rect.height,
      centerX: rect.width / 2,
      centerY: rect.height / 2,
      rootRadius: (vmin * 0.25) / 1.25,
      stackRadius: vmin < 400 ? 22 : vmin < 600 ? 26 : 30,
    };
  }, [wrapperRef]);

  // Initial measurement on mount
  useEffect(() => {
    const measurements = measureContainer();
    if (measurements) setDimensions(measurements);
  }, [measureContainer]);

  // ResizeObserver for container size changes
  useEffect(() => {
    if (!wrapperRef.current) return;

    const debouncedResize = debounce(() => {
      const measurements = measureContainer();
      if (measurements) setDimensions(measurements);
    }, 150);

    const resizeObserver = new ResizeObserver(debouncedResize);
    resizeObserver.observe(wrapperRef.current);

    return () => resizeObserver.disconnect();
  }, [measureContainer, wrapperRef]);

  // VisualViewport listener for iOS Safari toolbar show/hide
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleVisualViewportChange = debounce(() => {
      const measurements = measureContainer();
      if (measurements) setDimensions(measurements);
    }, 150);

    window.visualViewport.addEventListener(
      "resize",
      handleVisualViewportChange,
    );
    window.visualViewport.addEventListener(
      "scroll",
      handleVisualViewportChange,
    );

    return () => {
      window.visualViewport?.removeEventListener(
        "resize",
        handleVisualViewportChange,
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        handleVisualViewportChange,
      );
    };
  }, [measureContainer]);

  return { dimensions, measureContainer };
}
