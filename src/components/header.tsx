"use client";

import { useSearchParams } from "next/navigation";

import { Suspense, useEffect, useRef, useState } from "react";

import type { SearchInputHandle } from "~/components/search-input";
import { ContactDropdown } from "~/components/contact-dropdown";
import { DtfdLogo } from "~/components/dtfd-logo";
import { Icon } from "~/components/icon";
import { SearchInputWrapper } from "~/components/search-input-wrapper";
import { STACK_CLOUD_BREAKPOINTS } from "~/constants/breakpoints";

const HeaderContent = () => {
  const searchParams = useSearchParams();
  const hasSearchQuery = !!searchParams.get("query");
  const [showSearchInput, setShowSearchInput] = useState(hasSearchQuery);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<SearchInputHandle>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const isOpeningRef = useRef(false);
  const showSearchInputRef = useRef(showSearchInput);

  // Keep ref in sync with state for synchronous access in event handlers
  useEffect(() => {
    showSearchInputRef.current = showSearchInput;
  }, [showSearchInput]);

  // Show search input if there are search params
  useEffect(() => {
    setShowSearchInput(hasSearchQuery);
  }, [hasSearchQuery]);

  // Scroll to Projects section on mobile when SEARCH QUERY is submitted (not on filter interactions)
  // This effect only triggers on the "query" parameter from SearchInput, not on "filter" from StackCloud
  useEffect(() => {
    // Only on mobile (< md breakpoint) and only when there's a search query
    if (
      window.innerWidth >= STACK_CLOUD_BREAKPOINTS.MEDIUM ||
      !hasSearchQuery
    ) {
      return;
    }

    // Use a longer delay to ensure projects are rendered and filtered
    const timeoutId = setTimeout(() => {
      const projectsSection = document.getElementById("projects");
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
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

      // Check if we're on landscape-mobile (max-width: 1024px, max-height: 500px, landscape)
      const isLandscapeMobile =
        window.innerWidth <= STACK_CLOUD_BREAKPOINTS.LARGE &&
        window.innerHeight <= 500 &&
        window.innerWidth > window.innerHeight;

      // Only apply hide-on-scroll on mobile (< md breakpoint) or landscape-mobile
      if (
        window.innerWidth >= STACK_CLOUD_BREAKPOINTS.MEDIUM &&
        !isLandscapeMobile
      ) {
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

    // Use ref for synchronous state check to avoid race conditions
    const isCurrentlyVisible = showSearchInputRef.current;

    // If search is already visible, re-trigger animation by blurring then focusing
    if (isCurrentlyVisible) {
      // Focus immediately without setTimeout to prevent focus loss
      const isDesktop = window.innerWidth >= STACK_CLOUD_BREAKPOINTS.MEDIUM;
      const input = searchInputRef.current;
      if (input) {
        // Use requestAnimationFrame to ensure focus is applied after any pending DOM updates
        requestAnimationFrame(() => {
          // Blur then focus to re-trigger the onFocus event and animation
          input.blur?.();
          requestAnimationFrame(() => {
            input.focus?.();
            input.select?.();
            // Trigger bounce animation when already focused (only on desktop)
            if (isDesktop) {
              input.triggerBounce?.();
            }
          });
        });
      }
      return;
    }

    // On desktop with existing query: re-trigger animation by blurring then focusing
    if (window.innerWidth >= STACK_CLOUD_BREAKPOINTS.MEDIUM && hasSearchQuery) {
      const input = searchInputRef.current;
      if (input) {
        requestAnimationFrame(() => {
          // Blur then focus to re-trigger the onFocus event and animation
          input.blur?.();
          requestAnimationFrame(() => {
            input.focus?.();
            input.select?.();
            // Trigger bounce animation when already focused
            input.triggerBounce?.();
          });
        });
      }
      return;
    }

    // Toggle search input (open it)
    isOpeningRef.current = true;
    setShowSearchInput(true);

    // Focus the search input after it renders
    if (window.innerWidth >= STACK_CLOUD_BREAKPOINTS.MEDIUM) {
      // Desktop: standard RAF timing
      requestAnimationFrame(() => {
        searchInputRef.current?.focus?.();
        isOpeningRef.current = false;
      });
    } else {
      // Mobile: Focus immediately to maintain iOS user interaction context
      // iOS requires focus to be called synchronously within user event handler
      const input = searchInputRef.current;
      if (input) {
        input.focus?.();
        input.click?.();
        input.select?.();
      }
      // Reset opening flag after a longer delay to account for CSS transition (300ms) + some buffer
      setTimeout(() => {
        isOpeningRef.current = false;
      }, 400);
    }
  };

  const handleSearchButtonMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const searchButtonLabel =
    hasSearchQuery || showSearchInput ? "Edit search" : "Open search";

  // Click outside handler (desktop only - on mobile, search stays open until user clears it)
  useEffect(() => {
    // Only set up listener if search is showing, there's no query, and we're on desktop
    if (
      !showSearchInput ||
      hasSearchQuery ||
      window.innerWidth < STACK_CLOUD_BREAKPOINTS.MEDIUM
    )
      return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Don't close if clicking on the search container or button
      // Check if target is the button or inside the button
      const isClickOnButton =
        searchButtonRef.current?.contains(target) ||
        searchButtonRef.current === target;

      // Check if target is in the search container or is the container itself
      const isClickOnSearch =
        searchContainerRef.current?.contains(target) ||
        searchContainerRef.current === target;

      if (isClickOnButton || isClickOnSearch) {
        return;
      }

      // Close the search
      setShowSearchInput(false);
    };

    // Attach listener on next frame to avoid capturing the opening click
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
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
      // Check if we're on landscape-mobile
      const isLandscapeMobile =
        window.innerWidth <= STACK_CLOUD_BREAKPOINTS.LARGE &&
        window.innerHeight <= 500 &&
        window.innerWidth > window.innerHeight;

      // Don't close while opening (prevents closing when keyboard appears and triggers scroll)
      if (
        !isOpeningRef.current &&
        showSearchInput &&
        !hasSearchQuery &&
        (window.innerWidth < STACK_CLOUD_BREAKPOINTS.MEDIUM ||
          isLandscapeMobile)
      ) {
        handleCloseSearch();
      }
    };

    // Delay adding scroll listener to ignore scroll events from opening the search
    const timeoutId = setTimeout(() => {
      window.addEventListener("scroll", handleScrollClose);
    }, 500); // Increased delay to 500ms to account for keyboard appearing and scrolling

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScrollClose);
    };
  }, [showSearchInput, hasSearchQuery]);

  return (
    <header
      className={`sticky top-0 z-50 transition-transform duration-300 glass-header ${
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      } ${hasSearchQuery ? "md:sticky" : ""}`}
    >
      {/* Mobile: Full-width search overlay - positioned absolutely to not reserve space */}
      <div
        className={`md:hidden absolute inset-x-0 top-0 flex items-center px-4 py-3 w-full box-border overflow-hidden transition-opacity duration-300 ${
          showSearchInput || hasSearchQuery
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div ref={searchContainerRef} className="w-full magnetic-base">
          <SearchInputWrapper
            ref={searchInputRef}
            isMobileContainer
            onCloseEmpty={() => setShowSearchInput(false)}
          />
        </div>
      </div>

      {/* Mobile: Asymmetric layout matching desktop - kept mounted to prevent unmount animation flicker */}
      <div
        className={`md:hidden grid grid-cols-[1fr_2fr_1fr] items-center px-4 py-3 gap-4 transition-opacity duration-300 ${
          showSearchInput || hasSearchQuery
            ? "opacity-0 pointer-events-none"
            : "opacity-100"
        }`}
      >
        {/* Left column: Logo */}
        <div className="flex items-center justify-start">
          <div className="flex items-center justify-center">
            <DtfdLogo className="h-12 w-12 text-klein" />
          </div>
        </div>

        {/* Center: Title (name + subtitle) */}
        <div className="flex flex-col items-center justify-center min-w-0">
          <h1 className="text-lg font-bold text-slate-900">Daniël Terwiel</h1>
          <p className="text-sm text-slate-600">Developer</p>
        </div>

        {/* Right column: Menu with three action buttons (Contact, PDF, Search) */}
        <div className="flex items-center justify-end gap-2">
          {/* Contact Dropdown */}
          <ContactDropdown />

          {/* PDF Download Button */}
          <a
            href="/daniel-terwiel-resume.pdf"
            download="Daniel-Terwiel-Resume.pdf"
            className="rounded-md p-2 hidden sm:inline text-slate-600 transition-colors hover:bg-slate-100 hover:text-klein focus:bg-slate-100 focus:text-klein focus:outline-none focus:ring-2 focus:ring-klein focus:ring-offset-2"
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

      {/* Desktop: Asymmetric layout with logo on left, centered title, and menu on right */}
      <div className="hidden md:grid md:grid-cols-[1fr_2fr_1fr] md:items-center md:px-6 md:py-4 md:gap-6 glass-header-content">
        {/* Left column: Logo - matches width of right menu */}
        <div className="flex items-center justify-start">
          <div className="flex items-center justify-center">
            <DtfdLogo className="h-14 w-14 text-klein" />
          </div>
        </div>

        {/* Center: Title or Search Input - perfectly centered, fixed height to prevent jump */}
        <div className="flex flex-col items-center justify-center min-w-0 h-14 w-full relative">
          {/* Search Input - kept mounted to prevent unmount animation flicker */}
          <div
            className={`w-full max-w-md transition-opacity duration-300 absolute ${
              hasSearchQuery || showSearchInput
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div ref={searchContainerRef} className="w-full magnetic-base">
              <SearchInputWrapper
                ref={searchInputRef}
                onCloseEmpty={() => setShowSearchInput(false)}
              />
            </div>
          </div>

          {/* Title - kept mounted to prevent unmount animation flicker */}
          <div
            className={`text-center transition-opacity duration-300 ${
              hasSearchQuery || showSearchInput
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            }`}
          >
            <h1 className="text-xl font-bold text-slate-900">Daniël Terwiel</h1>
            <p className="text-sm text-slate-600">Developer</p>
          </div>
        </div>

        {/* Right column: Menu with three action buttons (Contact, PDF, Search) */}
        <div className="flex items-center justify-end gap-2">
          {/* Contact Dropdown */}
          <ContactDropdown />

          {/* PDF Download Button */}
          <a
            href="/daniel-terwiel-resume.pdf"
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
        <header className="sticky top-0 glass-header">
          <div className="flex items-center justify-between gap-4 p-4 md:grid md:grid-cols-3 md:gap-6 md:px-6 md:py-4 md:items-center">
            <div className="flex items-center justify-start">
              <div className="flex items-center justify-center md:h-10 md:w-10">
                <DtfdLogo className="h-8 w-8 text-klein md:h-10 md:w-10" />
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
