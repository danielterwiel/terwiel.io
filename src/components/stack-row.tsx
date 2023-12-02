"use client";

import React from "react";
import { clsx } from "clsx";

import * as Collapsible from "~/components/collapsible";
import { Icon } from "~/components/icon";
import { IconList, type ListItem } from "./icon-list";

const ICON_COLORS = {
  Assembly: "sm:hover:text-[#624FE8]",
  BrandCss3: "sm:hover:text-[#1572B6]",
  BrandGithub: "sm:hover:text-[#181717]",
  BrandGoogle: "sm:hover:text-[#4285F4]",
  BrandGraphql: "sm:hover:text-[#E10098]",
  BrandHtml5: "sm:hover:text-[#E34F26]",
  BrandJavascript: "sm:hover:text-[#F7DF1E]",
  BrandLinkedin: "sm:hover:text-[#0A66C2]",
  BrandPhp: "sm:hover:text-[#777BB4]",
  BrandReact: "sm:hover:text-[#61DAFB]",
  BrandRedux: "sm:hover:text-[#764ABC]",
  BrandRust: "sm:hover:text-[#DE4A00]",
  BrandSass: "sm:hover:text-[#CC6699]",
  BrandTailwind: "sm:hover:text-[#06B6D4]",
  BrandTypescript: "sm:hover:text-[#3178C6]",
  BrandVercel: "sm:hover:text-[#000000]",
  BrandVite: "sm:hover:text-[#646CFF]",
  BrandVue: "sm:hover:text-[#4FC08D]",
  Components: "sm:hover:text-[#384EF6]",
  Sql: "sm:hover:text-[#F29111]",
  Svg: "sm:hover:text-[#FFB13B]",
};

export function StackRow({ items }: { items: ListItem[] }) {
  const [open, setOpen] = React.useState(false);
  const [openBeforePrint, setOpenBeforePrint] = React.useState(false);
  const toggle = () => setOpen((prev) => !prev);
  const icons = items.filter(
    (obj, index, self) => index === self.findIndex((t) => t.icon === obj.icon),
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
      <dt className="m-0 flex print:m-0 print:items-start print:justify-end md:items-start md:justify-end">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2" onClick={toggle}>
            <span className="text-slate-400/50">
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
            </span>
            <span className="text-slate-500">Stack</span>
          </button>
        </div>
      </dt>
      <dd className="m-0 pl-4 md:pl-7">
        <Collapsible.Root open={open}>
          <Collapsible.Trigger onClick={() => toggle()} className="flex gap-1">
            {open ? (
              <div
                className="flex items-center gap-1 pt-1 print:hidden"
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
                  const color =
                    ICON_COLORS[item.icon as keyof typeof ICON_COLORS];
                  const hoverClass = color ? color : "hover:text-slate-400";
                  const iconClass = clsx([
                    hoverClass,
                    "text-slate-400/50",
                    "motion-safe:transition-colors",
                    "motion-safe:duration-200",
                    "pt-1",
                  ]);
                  return (
                    <div className={iconClass} key={item.name}>
                      <IconStack aria-hidden="true" width={24} height={24} />
                    </div>
                  );
                })}
              </>
            )}
          </Collapsible.Trigger>

          <Collapsible.Content>
            <div className="pl-4 print:pl-0 md:pl-2">
              <IconList items={items} />
            </div>
          </Collapsible.Content>
        </Collapsible.Root>
      </dd>
    </>
  );
}
