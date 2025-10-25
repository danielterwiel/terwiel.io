"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { Icon } from "~/components/icon";

const CONTACT_LINKS = [
  {
    id: "cv",
    label: "Download CV",
    icon: Icon.FileCv,
    href: "/CV.pdf",
    ariaLabel: "Download CV",
    className: "sm:hidden",
  },
  {
    id: "email",
    label: "Email",
    icon: Icon.Mail,
    href: "mailto:hello@terwiel.io",
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
];

export const ContactDropdown = () => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-klein focus:bg-slate-100 focus:text-klein focus:outline-none focus:ring-2 focus:ring-klein focus:ring-offset-2"
          aria-label="Contact options"
        >
          <Icon.Mail className="h-6 w-6" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-56 rounded-lg border border-slate-200 bg-white shadow-lg"
          sideOffset={8}
          align="end"
        >
          {CONTACT_LINKS.map((link) => {
            const LinkIcon = link.icon;
            return (
              <DropdownMenu.Item key={link.id} asChild>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 px-4 py-2 text-slate-700 outline-none transition-colors hover:bg-slate-50 hover:text-klein focus:bg-slate-100 focus:text-klein ${link.className || ""}`}
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
