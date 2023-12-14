import Link from "next/link";

import { Icon } from "~/components/icon";
import { ProfilePicture } from "./profile-picture";
import ContactButton from "./contact-button";

export default function Header() {
  return (
    <header>
      <ProfilePicture />
      <div className="p-4 text-right sm:text-left">
        <div className="flex flex-col justify-between sm:flex-row">
          <h1 className="mb-5">Daniël Terwiel</h1>
          <div className="md:jutify-end absolute left-3 flex flex-col gap-2 pt-1 print:relative print:items-end print:text-right print:text-xs md:relative md:flex-row md:items-start">
            <ContactButton />

            <Link
              className="group print:flex"
              href="https://www.linkedin.com/in/terwiel/"
              aria-label="View my LinkedIn profile"
            >
              <Icon.BrandLinkedin
                aria-hidden="true"
                className="text-white opacity-60 hover:opacity-100 group-focus:opacity-100 print:hidden sm:text-slate-800"
              />
              <span aria-hidden="true" className="hidden print:block">
                https://www.
              </span>
              <span className="hidden print:block">linkedin</span>
              <span aria-hidden="true" className="hidden print:block">
                .com/in/terwiel/
              </span>
            </Link>
            <Link
              className="group print:flex"
              href="https://github.com/danielterwiel"
              aria-label="View my GitHub profile"
            >
              <Icon.BrandGithub
                aria-hidden="true"
                className="text-white opacity-60 hover:opacity-100 group-focus:opacity-100 print:hidden sm:text-slate-800"
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
              href="https://www.terwiel.io"
              className="hidden print:block"
              aria-hidden="true"
            >
              https://www.terwiel.io/
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
