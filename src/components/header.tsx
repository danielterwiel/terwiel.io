"use client";

import { useSearchParams } from "next/navigation";

import { Suspense, useEffect, useRef, useState } from "react";

import { Icon } from "~/components/icon";
import { SearchInput } from "~/components/search-input";

const HeaderContent = () => {
  const searchParams = useSearchParams();
  const hasSearchQuery = !!searchParams.get("search");
  const [showSearchInput, setShowSearchInput] = useState(hasSearchQuery);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const isOpeningRef = useRef(false);

  // Show search input if there are search params
  useEffect(() => {
    setShowSearchInput(hasSearchQuery);
  }, [hasSearchQuery]);

  // Hide header on scroll down on mobile (except when search is active)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show header if search is active
      if (hasSearchQuery) {
        setIsHeaderVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Only apply hide-on-scroll on mobile (< md breakpoint: 768px)
      if (window.innerWidth >= 768) {
        setIsHeaderVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    // Throttle scroll events
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollListener);
    return () => window.removeEventListener("scroll", scrollListener);
  }, [hasSearchQuery]);

  const handleSearchIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    isOpeningRef.current = true;
    setShowSearchInput(true);
    // Focus the search input after it renders
    setTimeout(() => {
      searchInputRef.current?.focus();
      isOpeningRef.current = false;
    }, 150);
  };

  const handleSearchButtonMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Click outside handler
  useEffect(() => {
    // Only set up listener if search is showing and there's no query
    if (!showSearchInput || hasSearchQuery) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is inside the search container
      if (searchContainerRef.current?.contains(target)) {
        return;
      }

      // Close the search
      setShowSearchInput(false);
    };

    // Use requestAnimationFrame to ensure DOM has updated before adding listener
    let rafId: number;
    const timeoutId = setTimeout(() => {
      rafId = requestAnimationFrame(() => {
        document.addEventListener("mousedown", handleClickOutside);
      });
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchInput, hasSearchQuery]);

  // Close search on scroll (only on mobile and when no search query)
  useEffect(() => {
    if (!showSearchInput) return;

    const handleCloseSearch = () => {
      // Only close if there's no search query in URL and not in opening phase
      if (!hasSearchQuery && !isOpeningRef.current) {
        setShowSearchInput(false);
      }
    };

    const handleScrollClose = () => {
      if (showSearchInput && !hasSearchQuery && window.innerWidth < 768) {
        handleCloseSearch();
      }
    };

    // Delay adding scroll listener to ignore scroll events from opening the search
    const timeoutId = setTimeout(() => {
      window.addEventListener("scroll", handleScrollClose);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScrollClose);
    };
  }, [showSearchInput, hasSearchQuery]);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 bg-white backdrop-blur-sm transition-transform duration-300 ${
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      } ${hasSearchQuery ? "md:sticky" : ""}`}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        WebkitBackdropFilter: "blur(0.5rem)",
        backdropFilter: "blur(0.5rem)",
      }}
    >
      {/* Mobile: Switch between normal header and full-width search overlay */}
      {showSearchInput || hasSearchQuery ? (
        <div className="md:hidden flex items-center px-4 py-10 w-full box-border h-[3.5rem]">
          <div ref={searchContainerRef} className="w-full">
            <SearchInput
              ref={searchInputRef}
              onCloseEmpty={() => setShowSearchInput(false)}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 p-4 md:grid md:grid-cols-[auto_1fr_auto] md:gap-6 md:px-6 md:py-4">
          {/* Logo - always visible */}
          <div className="flex-shrink-0">
            <Icon.BrandReact className="h-8 w-8 text-klein md:h-10 md:w-10" />
          </div>

          {/* Title (name + subtitle) - always visible on desktop, hidden on mobile when needed */}
          <div className="flex flex-col items-center md:hidden">
            <h1 className="text-lg font-bold text-slate-900">Daniël Terwiel</h1>
            <p className="text-sm text-slate-600">Developer</p>
          </div>

          {/* Title (name + subtitle) - always visible on desktop */}
          <div className="hidden md:flex md:flex-col md:items-center">
            <h1 className="text-xl font-bold text-slate-900">Daniël Terwiel</h1>
            <p className="text-sm text-slate-600">Developer</p>
          </div>

          {/* Search - magnifier icon or full search input (desktop only) */}
          <div className="hidden md:flex md:flex-shrink-0 md:min-w-[300px]">
            {hasSearchQuery ? (
              <div ref={searchContainerRef} className="w-full">
                <SearchInput
                  ref={searchInputRef}
                  onCloseEmpty={() => setShowSearchInput(false)}
                />
              </div>
            ) : (
              <button
                ref={searchButtonRef}
                type="button"
                onMouseDown={handleSearchButtonMouseDown}
                onClick={handleSearchIconClick}
                className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-klein focus:bg-slate-100 focus:text-klein focus:outline-none focus:ring-2 focus:ring-klein focus:ring-offset-2"
                aria-label="Open search"
              >
                <Icon.Search className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Mobile search button - only visible on mobile when search is not active */}
          <button
            ref={searchButtonRef}
            type="button"
            onMouseDown={handleSearchButtonMouseDown}
            onClick={handleSearchIconClick}
            className="flex-shrink-0 md:hidden rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-klein focus:bg-slate-100 focus:text-klein focus:outline-none focus:ring-2 focus:ring-klein focus:ring-offset-2"
            aria-label="Open search"
          >
            <Icon.Search className="h-6 w-6" />
          </button>
        </div>
      )}
    </header>
  );
};

export const Header = () => {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 p-4 md:grid md:grid-cols-[auto_1fr_auto] md:gap-6 md:px-6 md:py-4">
            <div className="flex-shrink-0">
              <Icon.BrandReact className="h-8 w-8 text-klein md:h-10 md:w-10" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-900 md:text-xl">
                Daniël Terwiel
              </h1>
              <p className="text-sm text-slate-600">Developer</p>
            </div>
            <div className="flex-shrink-0">
              <div className="h-10 w-10" />
            </div>
          </div>
        </header>
      }
    >
      <HeaderContent />
    </Suspense>
  );
};
