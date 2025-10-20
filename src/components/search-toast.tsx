"use client";

import * as RadixToast from "@radix-ui/react-toast";
import { differenceInMonths, formatDuration, parseISO } from "date-fns";
import { X } from "lucide-react";

import { useRef, useState } from "react";

import type { Project } from "~/types";

export const SearchToast = ({
  query,
  items,
  isOpen,
  onOpenChange,
}: {
  query: string;
  items: Project[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const toastRef = useRef<HTMLLIElement>(null);
  const [isDismissing, setIsDismissing] = useState(false);

  const total = items.length;
  const monthsDiff = new Set<number>();

  for (const project of items) {
    const dateFrom = parseISO(project.dateFrom);
    const dateTo =
      project.dateTo === "present"
        ? parseISO(new Date().toISOString())
        : parseISO(project.dateTo);
    const diffInMonths = differenceInMonths(dateTo, dateFrom) + 1;
    monthsDiff.add(diffInMonths);
  }

  const monthsSum = Array.from(monthsDiff).reduce((acc, curr) => acc + curr, 0);
  const years = Math.floor(monthsSum / 12);
  const months = monthsSum % 12;

  const duration = formatDuration({ months, years }, { delimiter: " and " });

  const handleDismiss = () => {
    setIsDismissing(true);
    // Wait for animation to complete before closing
    setTimeout(() => {
      onOpenChange(false);
    }, 400);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isDismissing) {
      // Toast is auto-closing due to duration timeout
      setIsDismissing(true);
      // Wait for animation to complete before calling the original handler
      setTimeout(() => {
        onOpenChange(false);
      }, 400);
    } else if (isDismissing) {
      // Animation completed, actually close the toast
      onOpenChange(open);
    }
  };

  return (
    <RadixToast.Root
      ref={toastRef}
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={`magnetic-base magnetic-rounded-lg magnetic-card group pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border-2 border-klein bg-white p-4 shadow-lg md:min-w-80 ${isDismissing ? "toast-dismiss" : "toast-appear"}`}
    >
      <div className="flex-1">
        {total === 0 ? (
          <div className="text-klein">
            <p className="text-sm font-semibold">No results</p>
            <p className="mt-1 text-xs text-klein/70">
              Your search for <span className="font-medium">"{query}"</span> did
              not return any projects.
            </p>
          </div>
        ) : (
          <div className="text-klein">
            <p className="text-sm font-semibold">Search results</p>
            <p className="mt-2 text-xs text-klein/70">
              Your search for <span className="font-medium">"{query}"</span>{" "}
              returned <span className="font-semibold">{total}</span> project
              {total !== 1 ? "s" : ""} with a total duration of{" "}
              <span className="font-semibold">{duration}</span>.
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Close search results notification"
        className="relative h-6 w-6 flex-shrink-0 cursor-pointer text-klein/50 transition-colors hover:text-klein focus-visible:text-klein focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-klein"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </RadixToast.Root>
  );
};
