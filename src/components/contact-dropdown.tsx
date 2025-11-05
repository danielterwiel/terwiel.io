"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { clsx } from "clsx";

import { useRef, useState } from "react";

import { ContactDialog } from "~/components/contact-dialog";
import { Icon } from "~/components/icon";

interface ContactLink {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  ariaLabel: string;
  className?: string;
  isDownload?: boolean;
}

const CONTACT_LINKS: ContactLink[] = [
  {
    id: "cv",
    label: "Download PDF resume",
    icon: Icon.FileCv,
    href: "/daniel-terwiel-resume.pdf",
    ariaLabel: "Download PDF resume",
    className: "sm:hidden",
    isDownload: true,
  },
  {
    id: "github",
    label: "GitHub",
    icon: Icon.BrandGithub,
    href: "https://www.github.com/danielterwiel",
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

interface DropdownItemProps {
  link: ContactLink;
  onSelect: () => void;
}

const LinkDropdownItem = ({ link, onSelect }: DropdownItemProps) => {
  const LinkIcon = link.icon;

  const handleSelect = () => {
    // iOS Safari workaround: handle navigation in onSelect callback
    // This is necessary because Radix DropdownMenu has issues with anchor tags on iOS Safari
    if (link.isDownload) {
      // For downloads, create and trigger download
      const a = document.createElement("a");
      a.href = link.href;
      a.download = "daniel-terwiel-resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // For external links, open in new tab with security flags
      window.open(link.href, "_blank", "noopener,noreferrer");
    }
    // Close the dropdown after navigation is initiated
    onSelect();
  };

  // For external links, we open in new tab so we need to indicate this to users
  // For downloads, no indication needed as it's a standard download action
  const isExternal = !link.isDownload;
  const ariaLabel = isExternal
    ? `${link.ariaLabel} (opens in a new tab)`
    : link.ariaLabel;

  return (
    <DropdownMenu.Item onSelect={handleSelect}>
      <button
        type="button"
        className={clsx(
          "flex items-center gap-3 px-4 py-2 text-slate-700 outline-none transition-colors hover:bg-slate-50 hover:text-klein focus:bg-slate-100 focus:text-klein cursor-pointer w-full text-left",
          link.className,
        )}
        aria-label={ariaLabel}
        role="menuitem"
      >
        <LinkIcon className="h-6 w-6 flex-shrink-0 stroke-[1.5]" />
        <div className="flex items-center justify-between gap-1.5 w-full">
          <span className="text-sm font-medium">{link.label}</span>
          {isExternal && (
            <Icon.ExternalLink
              className="h-6 w-6 flex-shrink-0 text-slate-500 ml-1 scale-75"
              aria-hidden="true"
              focusable="false"
            />
          )}
        </div>
      </button>
    </DropdownMenu.Item>
  );
};

export const ContactDropdown = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openContactDialog = () => {
    dialogRef.current?.showModal();
    setIsOpen(false);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <>
      <ContactDialog ref={dialogRef} />
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-klein focus:bg-slate-100 focus:text-klein focus:outline-none focus:ring-2 focus:ring-klein focus:ring-offset-2"
            aria-label="Contact options"
            aria-haspopup="menu"
            aria-expanded={isOpen}
          >
            <Icon.Mail className="h-6 w-6" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-56 rounded-lg border border-slate-200 bg-white shadow-lg"
            sideOffset={8}
            align="end"
            role="menu"
          >
            <DropdownMenu.Item asChild>
              <button
                type="button"
                onClick={openContactDialog}
                className="flex w-full items-center gap-3 px-4 py-2 text-slate-700 outline-none transition-colors hover:bg-slate-50 hover:text-klein focus:bg-slate-100 focus:text-klein cursor-pointer"
                aria-label="Open contact form"
                role="menuitem"
              >
                <Icon.Mail className="h-6 w-6 flex-shrink-0 stroke-[1.5]" />
                <span className="text-sm font-medium">Email</span>
              </button>
            </DropdownMenu.Item>

            {CONTACT_LINKS.map((link) => (
              <LinkDropdownItem
                key={link.id}
                link={link}
                onSelect={closeDropdown}
              />
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  );
};
