import Link from "next/link";

import { Icon } from "~/components/icon";
import { ProfilePicture } from "./profile-picture";
import ContactButton from "./contact-button";
import PrintButton from "./print-button";

const Icons = () => (
  <div className="md:jutify-end absolute left-3 flex flex-col gap-2 pt-1.5 print:relative print:hidden print:items-end print:text-right print:text-xs md:relative md:flex-row md:items-start">
    <ContactButton />

    <Link
      className="group"
      href="https://www.linkedin.com/in/terwiel"
      aria-label="View my LinkedIn profile"
    >
      <Icon.BrandLinkedin
        aria-hidden="true"
        className="text-white opacity-60 hover:opacity-100 group-focus:opacity-100 md:text-slate-800"
      />
      <span className="sr-only">linkedin</span>
    </Link>
    <Link
      className="group"
      href="https://github.com/danielterwiel"
      aria-label="View my GitHub profile"
    >
      <Icon.BrandGithub
        aria-hidden="true"
        className="text-white opacity-60 hover:opacity-100 group-focus:opacity-100 md:text-slate-800"
      />

      <span className="sr-only">github</span>
    </Link>

    <PrintButton />
  </div>
);

export default function Header() {
  return (
    <header>
      <ProfilePicture />
      <div className="p-4 text-right sm:text-left">
        <div className="flex flex-col justify-between sm:flex-row">
          <h1 className="mb-5 whitespace-nowrap text-3xl print:text-5xl">
            Daniël Terwiel
          </h1>
          <Icons />
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
