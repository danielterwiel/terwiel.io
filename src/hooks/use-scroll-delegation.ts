import { useEffect, useRef } from "react";

/**
 * Delegates wheel scroll events to a target scrollable element
 * On desktop (md breakpoint), captures wheel events on the viewport
 * and scrolls the target element instead
 *
 * Uses passive event listeners for optimal performance
 */
export function useScrollDelegation(targetRef: React.RefObject<HTMLElement>) {
  const isDesktop = useRef(false);

  useEffect(() => {
    const checkDesktop = () => {
      isDesktop.current = window.innerWidth >= 768;
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);

    // Use passive listener for wheel events (performance)
    const handleWheel = (e: WheelEvent) => {
      if (!isDesktop.current || !targetRef.current) return;

      // Only intercept if not already scrolling the target
      const target = e.target as HTMLElement;
      if (targetRef.current.contains(target)) return;

      e.preventDefault();
      targetRef.current.scrollBy({
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
