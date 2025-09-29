import Link from "next/link";

import { Icon } from "./icon";

export default function Footer() {
  return (
    <footer className="break-before-avoid">
      <dl className="grid grid-flow-row md:grid-flow-col md:grid-rows-2">
        <dt className="flex items-center gap-1">
          <span className="text-slate-500/50">
            <Icon.User aria-hidden="true" focusable="false" />
          </span>
          <span className="text-slate-500">Name</span>
        </dt>
        <dd className="pl-7">Daniël Terwiel</dd>

        <dt className="flex items-center gap-1">
          <span className="text-slate-500/50">
            <Icon.HomeDollar aria-hidden="true" focusable="false" />
          </span>
          <span className="whitespace-nowrap text-slate-500">
            Chamber of Commerce
          </span>
        </dt>
        <dd className="pl-7">77988035</dd>

        <dt className="flex items-center gap-1">
          <span className="text-slate-500/50">
            <Icon.ReceiptTax aria-hidden="true" focusable="false" />
          </span>
          <span className="text-slate-500">VAT ID</span>
        </dt>
        <dd className="pl-7">NL003268186B97</dd>

        <dt
          aria-hidden="true"
          className="hidden items-center gap-1 text-slate-500 print:flex"
        >
          <span className="text-slate-500/50">
            <Icon.FileCv aria-hidden="true" focusable="false" />
          </span>
          <span className="text-slate-500">Portfolio</span>
        </dt>
        <dd aria-hidden="true" className="hidden pl-7 print:flex">
          <Link className="text-slate-500/70" href="https://www.terwiel.io">
            https://www.terwiel.io
          </Link>
        </dd>

        <dt
          aria-hidden="true"
          className="hidden items-center gap-1 text-slate-500 print:flex"
        >
          <span className="text-slate-500/50">
            <Icon.BrandLinkedin aria-hidden="true" focusable="false" />
          </span>
          <span className="text-slate-500">LinkedIn</span>
        </dt>
        <dd aria-hidden="true" className="hidden pl-7 print:flex">
          <Link
            className="text-slate-500/70"
            href="https://www.linkedin.com/in/terwiel/"
          >
            https://www.linkedin.com/in/terwiel
          </Link>
        </dd>

        <dt
          aria-hidden="true"
          className="hidden items-center gap-1 text-slate-500 print:flex"
        >
          <span className="text-slate-500/50">
            <Icon.BrandGithub aria-hidden="true" focusable="false" />
          </span>
          <span className="text-slate-500">GitHub</span>
        </dt>
        <dd aria-hidden="true" className="hidden pl-7 print:flex">
          <Link
            className="text-slate-500/70"
            href="https://github.com/danielterwiel"
          >
            https://github.com/danielterwiel
          </Link>
        </dd>
      </dl>
    </footer>
  );
}
