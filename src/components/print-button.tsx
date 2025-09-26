"use client";

import { Icon } from "~/components/icon";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => print()}
      className="group hidden md:inline"
    >
      <Icon.Printer
        aria-hidden="true"
        className="text-white opacity-60 hover:opacity-100 group-focus:opacity-100 md:text-slate-800"
      />
      <span className="sr-only">Print CV</span>
    </button>
  );
}
