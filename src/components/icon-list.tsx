"use client";

import Link from "next/link";
import Image from "next/image";

export type ListItem = {
  name: string;
  icon: string;
  url?: string;
};

export const IconList = ({ items }: { items: ListItem[] }) => {
  return (
    <ul className="-ml-5 list-none" role="list">
      {items.map((item) => (
        <li key={item.name}>
          <div className="flex items-center gap-2">
            <Image
              src={`/images/icons/${item.icon}.svg`}
              aria-hidden="true"
              className="my-0"
              alt=""
              width={24}
              height={24}
            />
            {item.url ? <Link href={item.url}>{item.name}</Link> : item.name}
          </div>
        </li>
      ))}
    </ul>
  );
};
