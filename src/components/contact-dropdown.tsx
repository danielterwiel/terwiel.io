"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "~/components/icon";

const CONTACT_LINKS = [
  {
    id: "email",
    label: "Email",
    icon: Icon.Mail,
    href: "mailto:daniel@terwiel.io",
    ariaLabel: "Send email to daniel@terwiel.io",
  },
  {
    id: "github",
    label: "GitHub",
    icon: Icon.BrandGithub,
    href: "https://github.com/danielterwiel",
    ariaLabel: "Visit GitHub profile",
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    icon: Icon.X,
    href: "https://twitter.com/danielt_dev",
    ariaLabel: "Visit X profile",
  },
];

export const ContactDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current?.contains(target) ||
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

  // Close dropdown when a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Contact Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-klein focus:bg-slate-100 focus:text-klein focus:outline-none focus:ring-2 focus:ring-klein focus:ring-offset-2"
        aria-label="Contact options"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Icon.Mail className="h-6 w-6" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg"
          role="menu"
        >
          <div className="py-2">
            {CONTACT_LINKS.map((link) => {
              const LinkIcon = link.icon;
              return (
                <a
                  key={link.id}
                  href={link.href}
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
