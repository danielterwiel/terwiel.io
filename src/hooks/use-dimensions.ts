import { useCallback, useEffect, useState } from "react";

import type { Dimensions } from "~/types/simulation";
import { STACK_CLOUD_BREAKPOINTS } from "~/constants/breakpoints";
import { debounce } from "~/utils/debounce";
import { calculateBaseStackRadius } from "~/utils/stack-cloud/calculate-base-radius";

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

    // Calculate root radius (scales with viewport)
    const rootRadius = vmin * STACK_CLOUD_BREAKPOINTS.ROOT_RADIUS_SCALE;

    // Calculate optimal base stack radius using circle packing algorithm
    // Accounts for: viewport area, node count, size factor distribution
    const stackRadius = calculateBaseStackRadius(
      rect.width,
      rect.height,
      rootRadius,
    );

    return {
      width: rect.width,
      height: rect.height,
      centerX: rect.width / 2,
      centerY: rect.height / 2,
      rootRadius,
      stackRadius,
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
    }, 100);

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
    }, 100);

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
