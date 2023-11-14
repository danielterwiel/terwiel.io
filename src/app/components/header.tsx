import Link from "next/link";
import Image from "next/image";

import { IconBrandGithub, IconBrandLinkedin } from "@tabler/icons-react";

export default function Header() {
  return (
    <header className="">
      <Image
        className="not-prose float-left mb-0 mr-2 aspect-[1/1]
          h-72 w-64 object-cover object-center shadow-lg
          [clip-path:circle(70%_at_20%_30%)]
          [shape-outside:circle(70%_at_20%_30%)]
          md:[clip-path:polygon(0%_0%,100%_0%,75%_100%,0%_100%)]
          md:[shape-outside:polygon(0%_0%,100%_0%,75%_100%,0%_100%)] lg:aspect-[1/2]"
        src="/images/dani.png"
        alt="Profile picture of Daniël Terwiel"
        width={640}
        height={640}
      />

      <div className="prose p-4 text-right sm:text-left">
        <div className="flex flex-col justify-between md:flex-row">
          <h1>Daniël Terwiel</h1>
          <div className="absolute left-2 flex flex-col justify-end gap-2 sm:relative sm:flex-row md:pt-1.5">
            <Link
              href="https://github.com/danielterwiel"
              className="sm:order-last"
            >
              <IconBrandGithub
                className="h-8 w-8 text-white opacity-60 hover:opacity-100 print:hidden sm:text-slate-800"
                aria-hidden="true"
              />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="https://www.linkedin.com/in/terwiel/">
              <IconBrandLinkedin
                className="h-8 w-8 text-white opacity-60 hover:opacity-100 print:hidden sm:text-slate-800"
                aria-hidden="true"
              />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
        <p>
          With more than 15 years in web development, I&apos;ve gained extensive
          knowledge and have succeeded in different settings, including
          startups, fast-growing companies, and large enterprises. My journey
          has evolved from a beginner, to a clean code absolutist, to a
          pragmatic who prioritizes simplicity and clear code over complexity.
        </p>
      </div>
    </header>
  );
}
