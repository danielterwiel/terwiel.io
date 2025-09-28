"use client";

import { clsx } from "clsx";

import React from "react";

import * as Collapsible from "~/components/collapsible";
import { Icon } from "~/components/icon";
import { getIconHoverColorClass } from "~/utils/icon-colors";
import { HighlightedIcon } from "./highlighted";
import { IconList, type ListItem } from "./icon-list";

export function StackRow({ items }: { items: ListItem[] }) {
  const [open, setOpen] = React.useState(false);
  const [openBeforePrint, setOpenBeforePrint] = React.useState(false);
  const toggle = () => setOpen((prev) => !prev);
  const icons = items.filter(
    (obj, index, self) => index === self.findIndex((t) => t.icon === obj.icon)
  );

  React.useEffect(() => {
    const openStack = () => {
      setOpenBeforePrint(open);
      setOpen(true);
    };
    const resetStack = () => {
      setOpenBeforePrint(open);
      setOpen(openBeforePrint);
    };

    window.addEventListener("beforeprint", openStack);
    window.addEventListener("closeprint", resetStack);

    return () => {
      window.removeEventListener("beforeprint", openStack);
      window.removeEventListener("closeprint", resetStack);
    };
  }, [open, openBeforePrint]);

  return (
    <>
      <dt className="m-0 flex justify-end md:items-start print:items-start print:justify-end">
        <button
          type="button"
          className="flex items-start gap-2"
          tabIndex={-1}
          onClick={toggle}
        >
          {open ? (
            <Icon.StackPop
              aria-hidden="true"
              width={24}
              height={24}
              className="text-slate-500/50"
            />
          ) : (
            <Icon.StackPush
              aria-hidden="true"
              width={24}
              height={24}
              className="text-slate-500/50"
            />
          )}
          <span className="font-normal text-slate-500">Stack</span>
        </button>
      </dt>
      <dd className="m-0  pl-4 md:pl-7">
        <Collapsible.Root open={open}>
          <Collapsible.Trigger
            onClick={() => toggle()}
            className="flex gap-1 outline-offset-4"
          >
            {open ? (
              <div
                className="flex items-center gap-1 print:hidden"
                aria-hidden="true"
              >
                <Icon.Minus
                  width={24}
                  height={24}
                  className="text-slate-500/50"
                />
                <span className="text-sm text-slate-800/70 underline hover:text-slate-800">
                  Minimize Stack
                </span>
              </div>
            ) : (
              <>
                <span className="sr-only">Stack details</span>
                {icons.map((item) => {
                  const IconStack = Icon[item.icon as keyof typeof Icon];
                  const hoverClass =
                    getIconHoverColorClass(item.icon) || "hover:text-slate-400";
                  const iconClass = clsx([
                    hoverClass,
                    "motion-safe:duration-200",
                    "motion-safe:transition-colors",
                    "overflow-x-hidden",
                    "pt-0.5",
                    "text-slate-400/50",
                    "transform-gpu",
                  ]);
                  return (
                    <HighlightedIcon
                      key={`${item.name}-${item.icon}`}
                      meta={item.name}
                    >
                      <IconStack className={iconClass} />
                    </HighlightedIcon>
                  );
                })}
              </>
            )}
          </Collapsible.Trigger>

          <Collapsible.Content>
            <div className="pl-4 md:pl-2 print:pl-0">
              <IconList items={items} highlight={true} />
            </div>
          </Collapsible.Content>
        </Collapsible.Root>
      </dd>
    </>
  );
}
