import { useEffect, useRef } from "react";

/**
 * Detects if the browser is Safari on macOS (not iOS)
 * Looks for "Macintosh" in user agent which indicates macOS
 */
function isSafariMac(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent;
  // Safari on macOS has "Macintosh" in UA, but not "Chrome", "Chromium", or "Edg"
  return (
    /Safari/i.test(ua) &&
    /Macintosh/i.test(ua) &&
    !/Chrome|Chromium|Edg/i.test(ua)
  );
}

/**
 * Delegates wheel scroll events from the StackCloud area to the window/viewport
 *
 * On desktop (md breakpoint), captures wheel events on the StackCloud side
 * and scrolls the viewport instead, which scrolls the Projects container.
 *
 * ## Performance Considerations (PERF-002)
 *
 * ### Passive Listeners
 * - Resize listener uses `{ passive: true }` for better performance
 * - Wheel listener uses `{ passive: false }` because it needs `preventDefault()`
 *
 * ### Event Handler Efficiency
 * - Early returns when not on desktop or when target is missing
 * - `getBoundingClientRect()` called once per event (not cached to handle resize)
 * - Uses `window.scrollBy({ behavior: 'auto' })` for immediate scroll (no animation)
 *
 * ### Safari Handling
 * Due to Safari's momentum scrolling and preventDefault() limitations,
 * we detect Safari and apply scroll delegation from the entire viewport in Safari.
 * Other browsers apply the standard delegated scroll approach.
 *
 * NOTE: This hook intentionally uses `passive: false` on the wheel event listener to allow
 * preventDefault() calls. Browser console will show warnings about non-passive scroll listeners,
 * but this is necessary for the dual-layout design to work correctly. The preventDefault() calls
 * are performant because they're only executed on specific conditions (Safari or outside Projects area).
 *
 * @see PERF-002 in PRD.md for runtime performance requirements
 */
export function useScrollDelegation(targetRef: React.RefObject<HTMLElement>) {
  const isDesktop = useRef(false);
  const isSafariRef = useRef(false);

  useEffect(() => {
    const checkDesktop = () => {
      isDesktop.current = window.innerWidth >= 768;
    };

    checkDesktop();
    isSafariRef.current = isSafariMac();
    window.addEventListener("resize", checkDesktop, { passive: true });

    const handleWheel = (e: WheelEvent) => {
      if (!isDesktop.current || !targetRef.current) return;

      // Get the bounding rect of the Projects container to check if cursor is over it
      const projectsRect = targetRef.current.getBoundingClientRect();

      // Safari-specific handling: Due to momentum scrolling and preventDefault() limitations,
      // we need to prevent default for the entire viewport to ensure scroll delegation works properly
      if (isSafariRef.current) {
        // In Safari, prevent default for all wheel events on the page
        // This allows window.scrollBy to work correctly
        e.preventDefault();

        // Delegate scroll to the window/viewport
        window.scrollBy({
          top: e.deltaY,
          left: 0,
          behavior: "auto",
        });
        return;
      }

      // For other browsers: Only delegate scroll from StackCloud area (left side)
      // If the mouse event is over the Projects scrollable area horizontally, don't delegate
      // (let it handle its own scrolling)
      if (e.clientX >= projectsRect.left && e.clientX <= projectsRect.right) {
        return;
      }

      // Delegate scroll to the window/viewport from StackCloud area
      e.preventDefault();

      window.scrollBy({
        top: e.deltaY,
        left: 0,
        behavior: "auto",
      });
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", checkDesktop);
    };
  }, [targetRef]);
}
