import { useEffect, useRef } from "react";

/**
 * Delegates wheel scroll events from the StackCloud area to the window/viewport
 * On desktop (md breakpoint), captures wheel events on the StackCloud side
 * and scrolls the viewport instead, which scrolls the Projects container
 */
export function useScrollDelegation(targetRef: React.RefObject<HTMLElement>) {
  const isDesktop = useRef(false);

  useEffect(() => {
    const checkDesktop = () => {
      isDesktop.current = window.innerWidth >= 768;
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);

    const handleWheel = (e: WheelEvent) => {
      if (!isDesktop.current || !targetRef.current) return;

      // Get the bounding rect of the Projects container to check if cursor is over it
      const projectsRect = targetRef.current.getBoundingClientRect();

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
