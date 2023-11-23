"use client";

import React from "react";
import * as Collapsible from "~/components/collapsible";
import Image from "next/image";

import { IconList, type ListItem } from "./icon-list";

export function Stack({ items }: { items: ListItem[] }) {
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen((prev) => !prev);
  const icons = items.filter(
    (obj, index, self) => index === self.findIndex((t) => t.icon === obj.icon),
  );
  return (
    <Collapsible.Root>
      <Collapsible.Trigger onClick={() => toggle()}>
        <div className="flex items-center gap-2">
          {open
            ? null
            : icons.map((item) => (
                <div className="text-slate-200" key={item.name}>
                  <Image
                    key={item.name}
                    src={`/images/icons/${item.icon}.svg`}
                    aria-hidden="true"
                    className="my-0"
                    alt=""
                    width={24}
                    height={24}
                  />
                </div>
              ))}
        </div>
      </Collapsible.Trigger>

      <Collapsible.Content>
        <IconList open={open} items={items} />
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
