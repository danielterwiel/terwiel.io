import { useEffect, useRef } from "react";

/**
 * Detects if the browser is Safari on macOS
 * Uses feature detection approach to identify Safari and exclude Chrome-based browsers
 */
function isSafari(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent;
  // Safari contains "Safari" and "Mac", but not "Chrome", "Chromium", or "Edg"
  return (
    /Safari/i.test(ua) && /Mac/i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua)
  );
}

/**
 * Delegates wheel scroll events from the StackCloud area to the window/viewport
 * On desktop (md breakpoint), captures wheel events on the StackCloud side
 * and scrolls the viewport instead, which scrolls the Projects container
 *
 * Special handling for Safari: Due to Safari's momentum scrolling and preventDefault() limitations,
 * we detect Safari and apply scroll delegation from the entire viewport in Safari.
 * Other browsers apply the standard delegated scroll approach.
 */
export function useScrollDelegation(targetRef: React.RefObject<HTMLElement>) {
  const isDesktop = useRef(false);
  const isSafariRef = useRef(false);

  useEffect(() => {
    const checkDesktop = () => {
      isDesktop.current = window.innerWidth >= 768;
    };

    checkDesktop();
    isSafariRef.current = isSafari();
    window.addEventListener("resize", checkDesktop);

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
