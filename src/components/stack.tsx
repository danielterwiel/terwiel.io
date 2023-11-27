"use client";

import React from "react";
import { clsx } from "clsx";
import * as Collapsible from "~/components/collapsible";
import { Icon } from "~/components/icon";
import { IconList, type ListItem } from "./icon-list";

const brandColors = {
  Assembly: "hover:text-[#624FE8]",
  BrandCss3: "hover:text-[#1572B6]",
  BrandGithub: "hover:text-[#181717]",
  BrandGoogle: "hover:text-[#4285F4]",
  BrandGraphql: "hover:text-[#E10098]",
  BrandHtml5: "hover:text-[#E34F26]",
  BrandJavascript: "hover:text-[#F7DF1E]",
  BrandLinkedin: "hover:text-[#0A66C2]",
  BrandPhp: "hover:text-[#777BB4]",
  BrandReact: "hover:text-[#61DAFB]",
  BrandRedux: "hover:text-[#764ABC]",
  BrandRust: "hover:text-[#DE4A00]",
  BrandSass: "hover:text-[#CC6699]",
  BrandTailwind: "hover:text-[#06B6D4]",
  BrandTypescript: "hover:text-[#3178C6]",
  BrandVercel: "hover:text-[#000000]",
  BrandVite: "hover:text-[#646CFF]",
  BrandVue: "hover:text-[#4FC08D]",
  Components: "hover:text-[#384EF6]", // used for Lit HTML logo
};

export function Stack({ items }: { items: ListItem[] }) {
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen((prev) => !prev);
  const icons = items.filter(
    (obj, index, self) => index === self.findIndex((t) => t.icon === obj.icon),
  );
  return (
    <>
      <dt className="flex gap-2 md:m-0 md:justify-end">
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
        <span className="text-slate-400">Stack</span>
      </dt>
      <dd className="m-0 pl-4">
        <Collapsible.Root>
          <Collapsible.Trigger onClick={() => toggle()}>
            <div className="flex items-center gap-2">
              {open ? (
                <>
                  <span className="text-slate-800/80 underline hover:text-slate-800">
                    Minimize Stack
                  </span>
                  <Icon.StackPop
                    aria-hidden="true"
                    width={24}
                    height={24}
                    className="text-slate-500/50"
                  />
                </>
              ) : (
                icons.map((item) => {
                  const IconStack = Icon[item.icon as keyof typeof Icon];
                  const color =
                    brandColors[item.icon as keyof typeof brandColors];
                  const colorClass = color ? color : "hover:text-slate-400";
                  const iconClass = clsx([
                    colorClass,
                    "text-slate-400/50",
                    "transition-colors",
                    "duration-200",
                    "pt-1",
                  ]);
                  return (
                    <div className={iconClass} key={item.name}>
                      <IconStack aria-hidden="true" width={24} height={24} />
                    </div>
                  );
                })
              )}
            </div>
          </Collapsible.Trigger>

          <Collapsible.Content data-state={open ? "open" : "closed"}>
            <IconList items={items} />
          </Collapsible.Content>
        </Collapsible.Root>
      </dd>
    </>
  );
}
