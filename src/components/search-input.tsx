"use client";

import React from "react";

import { SearchInputContent } from "~/components/search-input-content";

export function SearchInput() {
  return (
    <React.Suspense
      fallback={<div className="print:hidden">Loading search...</div>}
    >
      <SearchInputContent />
    </React.Suspense>
  );
}
