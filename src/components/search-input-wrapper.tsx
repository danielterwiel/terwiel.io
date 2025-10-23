import { forwardRef } from "react";

import type { SearchInputHandle } from "~/components/search-input";
import { SearchInput } from "~/components/search-input";
import { useMediaQuery } from "~/hooks/use-media-query";

interface SearchInputWrapperProps {
  onCloseEmpty: () => void;
  isMobileContainer?: boolean;
}

/**
 * Unified SearchInput wrapper that conditionally renders for mobile/desktop
 * Eliminates the need for separate refs and duplicate components
 * Uses a single SearchInput instance that appears in both viewport layouts
 */
export const SearchInputWrapper = forwardRef<
  SearchInputHandle,
  SearchInputWrapperProps
>(({ onCloseEmpty, isMobileContainer }, ref) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Only render this instance if it matches the current viewport
  // Mobile container renders when NOT desktop, desktop container renders when IS desktop
  if (isMobileContainer && isDesktop) return null;
  if (!isMobileContainer && !isDesktop) return null;

  return <SearchInput ref={ref} onCloseEmpty={onCloseEmpty} />;
});

SearchInputWrapper.displayName = "SearchInputWrapper";
