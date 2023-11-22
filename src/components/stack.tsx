"use client";

import React from "react";
import * as Collapsible from "~/components/collapsible";
import Image from "next/image";

import { IconList, type ListItem } from "./icon-list";

export function Stack({ items }: { items: ListItem[] }) {
  const [open, setOpen] = React.useState(false);

  const toggle = () => setOpen((prev) => !prev);

  return (
    <Collapsible.Root>
      <Collapsible.Trigger onClick={() => toggle()}>
        <div className="flex items-center gap-2">
          {open ? (
            <Image
              src="/images/icons/stack-push.svg"
              aria-hidden="true"
              className="my-0"
              alt=""
              width={24}
              height={24}
            />
          ) : (
            <Image
              src="/images/icons/stack-pop.svg"
              aria-hidden="true"
              className="my-0"
              alt=""
              width={24}
              height={24}
            />
          )}

          <div>Stack</div>
        </div>
      </Collapsible.Trigger>

      <Collapsible.Content>
        <IconList items={items} />
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
