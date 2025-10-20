"use client";

import { useSearchParams } from "next/navigation";

import { Suspense, useEffect, useRef, useState } from "react";

import { ContactDropdown } from "~/components/contact-dropdown";
import { Icon } from "~/components/icon";
import { MobileMenu } from "~/components/mobile-menu";
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

      // Always show header if search is active or search input is open
      if (hasSearchQuery || showSearchInput) {
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
  }, [hasSearchQuery, showSearchInput]);

  const handleSearchIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // On desktop with existing query: focus input and select all
    if (window.innerWidth >= 768 && hasSearchQuery) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 0);
      return;
    }

    // Toggle search input
    isOpeningRef.current = true;
    setShowSearchInput(!showSearchInput);

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

  const searchButtonLabel =
    hasSearchQuery || showSearchInput ? "Edit search" : "Open search";

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
      className={`sticky top-0 z-40 bg-white backdrop-blur-sm transition-transform duration-300 ${
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      } ${hasSearchQuery ? "md:sticky" : ""}`}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        WebkitBackdropFilter: "blur(0.5rem)",
        backdropFilter: "blur(0.5rem)",
      }}
    >
      {/* Mobile: Full-width search overlay and normal header - choose one on mobile */}
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
        <div className="flex items-center justify-between gap-4 p-4 md:hidden">
          {/* Mobile: Logo - reserve space matching right menu width */}
          <div className="flex items-center justify-start w-16">
            <Icon.BrandReact className="h-8 w-8 text-klein" />
          </div>

          {/* Mobile: Title (name + subtitle) - perfectly centered */}
          <div className="flex flex-col items-center flex-1">
            <h1 className="text-lg font-bold text-slate-900">Daniël Terwiel</h1>
            <p className="text-sm text-slate-600">Developer</p>
          </div>

          {/* Mobile: Menu icons (Hamburger + Search) */}
          <div className="flex items-center justify-end gap-1 w-16">
            {/* Mobile: Hamburger Menu */}
            <MobileMenu />

            {/* Mobile: Search button */}
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
          </div>
        </div>
      )}

      {/* Desktop: Asymmetric layout with logo on left, centered title, and menu on right */}
      <div className="hidden md:grid md:grid-cols-[1fr_2fr_1fr] md:items-center md:px-6 md:py-4 md:gap-6">
        {/* Left column: Logo - matches width of right menu */}
        <div className="flex items-center justify-start">
          <div className="flex items-center justify-center">
            <Icon.BrandReact className="h-10 w-10 text-klein" />
          </div>
        </div>

        {/* Center: Title or Search Input - perfectly centered, fixed height to prevent jump */}
        <div className="flex flex-col items-center justify-center min-w-0 h-14">
          {hasSearchQuery || showSearchInput ? (
            <div ref={searchContainerRef} className="w-full max-w-md">
              <SearchInput
                ref={searchInputRef}
                onCloseEmpty={() => setShowSearchInput(false)}
              />
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-slate-900">
                Daniël Terwiel
              </h1>
              <p className="text-sm text-slate-600">Developer</p>
            </>
          )}
        </div>

        {/* Right column: Menu with three action buttons (Contact, PDF, Search) */}
        <div className="flex items-center justify-end gap-2">
          {/* Contact Dropdown */}
          <ContactDropdown />

          {/* PDF Download Button */}
          <a
            href="/resume.pdf"
            download="Daniel-Terwiel-Resume.pdf"
            className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-klein focus:bg-slate-100 focus:text-klein focus:outline-none focus:ring-2 focus:ring-klein focus:ring-offset-2"
            aria-label="Download resume as PDF"
          >
            <Icon.FileCv className="h-6 w-6" />
          </a>

          {/* Search Button */}
          <button
            ref={searchButtonRef}
            type="button"
            onMouseDown={handleSearchButtonMouseDown}
            onClick={handleSearchIconClick}
            className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-klein focus:bg-slate-100 focus:text-klein focus:outline-none focus:ring-2 focus:ring-klein focus:ring-offset-2"
            aria-label={searchButtonLabel}
          >
            <Icon.Search className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export const Header = () => {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 p-4 md:grid md:grid-cols-3 md:gap-6 md:px-6 md:py-4 md:items-center">
            <div className="flex items-center justify-start">
              <div className="flex items-center justify-center md:h-10 md:w-10">
                <Icon.BrandReact className="h-8 w-8 text-klein md:h-10 md:w-10" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h1 className="text-lg font-bold text-slate-900 md:text-xl">
                Daniël Terwiel
              </h1>
              <p className="text-sm text-slate-600">Developer</p>
            </div>
            <div className="flex items-center justify-end">
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
