"use client";

import React from "react";
import * as Collapsible from "~/components/collapsible";

import { Icon } from "~/components/icon";
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
          {open ? (
            <Icon.StackPop
              aria-hidden="true"
              width={24}
              height={24}
              className="text-slate-500"
            />
          ) : (
            icons.map((item) => {
              const IconStack = Icon[item.icon];
              return (
                <div className="text-slate-400/50" key={item.name}>
                  <IconStack aria-hidden="true" width={24} height={24} />
                </div>
              );
            })
          )}
        </div>
      </Collapsible.Trigger>

      <Collapsible.Content>
        <IconList items={items} />
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
