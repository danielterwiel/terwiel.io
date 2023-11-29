import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";

import { Icon } from "~/components/icon";
import profilePictureDani from "../images/dani.png";
import profilePictureLove from "../images/love.png";

export default function Header() {
  const defaultClassName = [
    "not-prose",
    "motion-safe:animation-fade-in",
    "float-left",
    "mb-0",
    "h-auto",
    "w-auto",
    "aspect-[1/1]",
    "object-cover",
    "object-center",
    "shadow-lg",
    "[clip-path:circle(70%_at_20%_30%)]",
    "[shape-outside:circle(70%_at_20%_30%)]",
    "sm:mr-4",
    "md:mr-6",
    "md:[clip-path:polygon(0%_0%,100%_0%,75%_100%,0%_100%)]",
    "md:[shape-outside:polygon(0%_0%,100%_0%,75%_100%,0%_100%)]",
    "lg:aspect-[1/2]",
  ];
  const classNameLove = clsx(defaultClassName, ["absolute", "left-0"]);
  const classNameDani = clsx(defaultClassName);
  return (
    <header>
      <Image
        className={classNameLove}
        src={profilePictureLove}
        alt="Profile picture of Daniël Terwiel and girlfriend"
        width={128}
        height={256}
      />
      <Image
        className={classNameDani}
        src={profilePictureDani}
        alt="Profile picture of Daniël Terwiel"
        width={128}
        height={256}
      />

      <div className="p-4 text-right sm:text-left">
        <div className="flex flex-col justify-between sm:flex-row">
          <h1 className="mb-5">Daniël Terwiel</h1>
          <div className="absolute left-3 flex flex-col justify-end gap-2 print:gap-0 sm:relative sm:flex-row sm:pt-2 print:sm:flex-col md:pt-2">
            <Link
              href="https://github.com/danielterwiel"
              className="flex sm:order-last"
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
            <Link href="https://www.linkedin.com/in/terwiel/" className="flex">
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

        <div className="absolute inset-x-0 left-0 top-1/2 -ml-[58rem] hidden h-0.5 rotate-[96.95deg] bg-gradient-to-r from-slate-400/10 md:block"></div>

        <p className="print:text-2xl">
          With over 15 years in web development, I&apos;ve gained extensive
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
