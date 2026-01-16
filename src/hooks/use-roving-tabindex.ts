import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Hook for implementing the roving tabindex pattern (WAI-ARIA APG)
 *
 * Creates a single tab stop for a collection of interactive elements,
 * with arrow key navigation within the collection.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
 *
 * @param items - Array of items to navigate
 * @param options - Configuration options
 * @returns Focus management functions and state
 */
export function useRovingTabindex<T extends { id: string }>(
  items: T[],
  options: {
    /**
     * Initial active index
     */
    initialIndex?: number;
    /**
     * Whether the navigation should wrap around (first -> last, last -> first)
     */
    loop?: boolean;
    /**
     * Direction of navigation: "horizontal" (Left/Right) or "vertical" (Up/Down) or "both"
     */
    direction?: "horizontal" | "vertical" | "both";
    /**
     * Callback when active index changes
     */
    onActiveIndexChange?: (index: number) => void;
  } = {},
) {
  const { initialIndex = 0, loop = true, direction = "both" } = options;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLElement | SVGSVGElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement | SVGGElement>>(new Map());

  // Build index map for O(1) lookup instead of O(n) findIndex per item
  const indexMap = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 0; i < items.length; i++) {
      map.set(items[i].id, i);
    }
    return map;
  }, [items]);

  // Track if focus is within the container
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  // Update active index and call callback
  const updateActiveIndex = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= items.length) return;
      setActiveIndex(newIndex);
      options.onActiveIndexChange?.(newIndex);
    },
    [items.length, options],
  );

  // Navigate to next item
  const navigateNext = useCallback(() => {
    const nextIndex = activeIndex + 1;
    if (nextIndex < items.length) {
      updateActiveIndex(nextIndex);
    } else if (loop) {
      updateActiveIndex(0);
    }
  }, [activeIndex, items.length, loop, updateActiveIndex]);

  // Navigate to previous item
  const navigatePrevious = useCallback(() => {
    const prevIndex = activeIndex - 1;
    if (prevIndex >= 0) {
      updateActiveIndex(prevIndex);
    } else if (loop) {
      updateActiveIndex(items.length - 1);
    }
  }, [activeIndex, items.length, loop, updateActiveIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { key } = event;

      // Horizontal navigation
      if (direction === "horizontal" || direction === "both") {
        if (key === "ArrowRight") {
          event.preventDefault();
          navigateNext();
          return;
        }
        if (key === "ArrowLeft") {
          event.preventDefault();
          navigatePrevious();
          return;
        }
      }

      // Vertical navigation
      if (direction === "vertical" || direction === "both") {
        if (key === "ArrowDown") {
          event.preventDefault();
          navigateNext();
          return;
        }
        if (key === "ArrowUp") {
          event.preventDefault();
          navigatePrevious();
          return;
        }
      }

      // Home/End keys
      if (key === "Home") {
        event.preventDefault();
        updateActiveIndex(0);
      } else if (key === "End") {
        event.preventDefault();
        updateActiveIndex(items.length - 1);
      }

      // Tab key handling - IMPORTANT: Tab/Shift+Tab should ALWAYS escape the roving tabindex
      // Do NOT use Tab to navigate within items - only use arrow keys for that
      // This follows WAI-ARIA APG best practices where each roving tabindex group
      // has exactly one tab stop (the currently active item)
      if (key === "Tab") {
        // Always allow Tab/Shift+Tab to escape - don't prevent default
        // Let the browser move focus to the next focusable element in the DOM
        return;
      }
    },
    [
      direction,
      items.length,
      navigateNext,
      navigatePrevious,
      updateActiveIndex,
    ],
  );

  // Focus the active item
  const focusActiveItem = useCallback(() => {
    const activeItem = items[activeIndex];
    if (!activeItem) return;

    const element = itemRefs.current.get(activeItem.id);
    if (element) {
      // Use requestAnimationFrame to ensure DOM is updated before focusing
      requestAnimationFrame(() => {
        element.focus();
      });
    }
  }, [activeIndex, items]);

  // Auto-focus active item when activeIndex changes and focus is within container
  useEffect(() => {
    if (isFocusWithin) {
      focusActiveItem();
    }
  }, [focusActiveItem, isFocusWithin]);

  // Register item ref
  const registerItemRef = useCallback(
    (id: string, element: HTMLElement | SVGGElement | null) => {
      if (element) {
        itemRefs.current.set(id, element);
      } else {
        itemRefs.current.delete(id);
      }
    },
    [],
  );

  // Get tabIndex for item - O(1) via indexMap
  const getTabIndex = useCallback(
    (itemId: string) => {
      const index = indexMap.get(itemId) ?? -1;
      return index === activeIndex ? 0 : -1;
    },
    [activeIndex, indexMap],
  );

  // Handle container focus
  const handleContainerFocus = useCallback(() => {
    setIsFocusWithin(true);
  }, []);

  // Handle container blur
  const handleContainerBlur = useCallback((event: React.FocusEvent) => {
    // Check if focus is moving outside the container
    const currentTarget = event.currentTarget;
    // Give DOM time to update before checking
    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        setIsFocusWithin(false);
      }
    }, 0);
  }, []);

  return {
    activeIndex,
    containerRef,
    itemRefs,
    registerItemRef,
    getTabIndex,
    handleKeyDown,
    handleContainerFocus,
    handleContainerBlur,
    setActiveIndex: updateActiveIndex,
    focusActiveItem,
  };
}
