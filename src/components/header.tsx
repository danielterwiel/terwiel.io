import Link from "next/link";

import { Icon } from "~/components/icon";
import { ProfilePicture } from "./profile-picture";

export default function Header() {
  return (
    <header>
      <ProfilePicture />

      <div className="p-4 text-right sm:text-left">
        <div className="flex flex-col justify-between sm:flex-row">
          <h1 className="mb-5">Daniël Terwiel</h1>
          <div className="absolute left-3 flex flex-col justify-end gap-2 print:items-end print:justify-start print:gap-0 print:pt-0 print:text-right print:text-sm sm:relative sm:flex-row sm:pt-2 print:sm:flex-col">
            <Link
              href="https://www.terwiel.io"
              className="hidden print:block"
              aria-hidden="true"
            >
              https://www.terwiel.io/
            </Link>
            <Link
              href="https://github.com/danielterwiel"
              className="flex sm:order-last"
              aria-label="View my GitHub profile"
            >
              <Icon.BrandGithub
                aria-hidden="true"
                className="h-7 w-7 text-white opacity-60 hover:opacity-100 print:hidden sm:text-slate-800"
              />

              <span aria-hidden="true" className="hidden print:block">
                https://www.
              </span>
              <span className="hidden print:block">github</span>
              <span aria-hidden="true" className="hidden print:block">
                .com/danielterwiel/
              </span>
            </Link>
            <Link
              href="https://www.linkedin.com/in/terwiel/"
              className="flex"
              aria-label="View my LinkedIn profile"
            >
              <Icon.BrandLinkedin
                aria-hidden="true"
                className="h-7 w-7 text-white opacity-60 hover:opacity-100 print:hidden sm:text-slate-800"
              />
              <span aria-hidden="true" className="hidden print:block">
                https://www.
              </span>
              <span className="hidden print:block">linkedin</span>
              <span aria-hidden="true" className="hidden print:block">
                .com/in/terwiel/
              </span>
            </Link>
          </div>
        </div>

        <p className="print:text-2xl">
          With over 18 years in web development, I&apos;ve gained extensive
          knowledge and a lot of experience in different settings, including
          startups, hyper-growth scale-ups, and large enterprises. My journey
          has evolved from a beginner to a clean code absolutist, to becoming
          more pragmatic, prioritizing simplicity and clear code over
          complexity.
        </p>
      </div>
    </header>
  );
}
