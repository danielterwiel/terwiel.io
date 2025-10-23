"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

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
    id: "linkedin",
    label: "LinkedIn",
    icon: Icon.BrandLinkedin,
    href: "https://linkedin.com/in/terwiel",
    ariaLabel: "Visit LinkedIn profile",
  },
  {
    id: "twitter",
    label: "Twitter",
    icon: Icon.BrandTwitter,
    href: "https://twitter.com/terwiel",
    ariaLabel: "Visit Twitter profile",
  },
  {
    id: "email",
    label: "Email",
    icon: Icon.Mail,
    href: "mailto:daniel@terwiel.io",
    ariaLabel: "Send email to daniel@terwiel.io",
  },
];

export const MobileMenu = () => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-klein focus:bg-slate-100 focus:text-klein focus:outline-none focus:ring-2 focus:ring-klein focus:ring-offset-2"
          aria-label="Menu"
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
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-64 rounded-lg border border-slate-200 bg-white shadow-xl"
          sideOffset={8}
          align="end"
        >
          {MENU_LINKS.map((link) => {
            const LinkIcon = link.icon;
            return (
              <DropdownMenu.Item key={link.id} asChild>
                <a
                  href={link.href}
                  download={link.download}
                  target={link.href.startsWith("mailto") ? undefined : "_blank"}
                  rel={
                    link.href.startsWith("mailto")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="flex items-center gap-3 px-4 py-2 text-slate-700 outline-none transition-colors hover:bg-slate-50 hover:text-klein focus:bg-slate-100 focus:text-klein"
                  aria-label={link.ariaLabel}
                >
                  <LinkIcon className="h-6 w-6 flex-shrink-0 stroke-[1.5]" />
                  <span className="text-sm font-medium">{link.label}</span>
                </a>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
