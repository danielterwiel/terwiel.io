"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "~/components/icon";

const MENU_LINKS = [
  {
    id: "resume",
    label: "Download resume",
    icon: Icon.FileCv,
    href: "/resume.pdf",
    download: "Daniel-Terwiel-Resume.pdf",
    ariaLabel: "Download resume as PDF",
  },
  {
    id: "github",
    label: "GitHub",
    icon: Icon.BrandGithub,
    href: "https://github.com/danielterwiel",
    ariaLabel: "Visit GitHub profile",
  },
  {
    id: "email",
    label: "Email",
    icon: Icon.Mail,
    href: "mailto:daniel@terwiel.io",
    ariaLabel: "Send email to daniel@terwiel.io",
  },
  {
    id: "twitter",
    label: "Twitter",
    icon: Icon.X,
    href: "https://twitter.com/danielt_dev",
    ariaLabel: "Visit X profile",
  },
];

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    // Delay to avoid closing immediately on open click
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Close menu when a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
      {/* Hamburger Menu Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-klein focus:bg-slate-100 focus:text-klein focus:outline-none focus:ring-2 focus:ring-klein focus:ring-offset-2"
        aria-label="Menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {/* Hamburger Icon */}
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Menu"
        >
          <title>Menu</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Dropdown Menu - uses absolute positioning within relative parent with high z-index */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-xl"
          role="menu"
        >
          <div className="py-2">
            {MENU_LINKS.map((link) => {
              const LinkIcon = link.icon;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  download={link.download}
                  target={link.href.startsWith("mailto") ? undefined : "_blank"}
                  rel={
                    link.href.startsWith("mailto")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-50 hover:text-klein"
                  role="menuitem"
                  aria-label={link.ariaLabel}
                >
                  <LinkIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">{link.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
