"use client";

import Link from "next/link";
import { Icon } from "~/components/icon";

export type ListItem = {
  name: string;
  icon: string;
  url?: string;
};

export const IconList = ({ items }: { items: ListItem[] }) => {
  const icons = items.filter(
    (obj, index, self) => index === self.findIndex((t) => t.icon === obj.icon),
  );

  return (
    <ul className="-ml-5 list-none" role="list">
      {icons.map((item) => {
        const IconItem = Icon[item.icon];
        return (
          <li key={item.name}>
            <div className="flex items-center gap-2">
              <IconItem aria-hidden="true" width={24} height={24} />
              {item.url ? <Link href={item.url}>{item.name}</Link> : item.name}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
