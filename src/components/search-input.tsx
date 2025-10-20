"use client";

import React from "react";

import { SearchInputContent } from "~/components/search-input-content";

interface SearchInputProps {
  onCloseEmpty?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onCloseEmpty }, ref) => {
    return (
      <React.Suspense
        fallback={<div className="print:hidden">Loading search...</div>}
      >
        <SearchInputContent ref={ref} onCloseEmpty={onCloseEmpty} />
      </React.Suspense>
    );
  },
);

SearchInput.displayName = "SearchInput";
