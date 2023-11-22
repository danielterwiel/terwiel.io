import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header>
      <Image
        className="not-prose motion-safe:fade-in-animation float-left mb-0 mr-2 aspect-[1/1] h-72
          w-64 object-cover object-center shadow-lg
          [clip-path:circle(70%_at_20%_30%)]
          [shape-outside:circle(70%_at_20%_30%)]
          sm:mr-4
          md:mr-6
          md:[clip-path:polygon(0%_0%,100%_0%,75%_100%,0%_100%)] md:[shape-outside:polygon(0%_0%,100%_0%,75%_100%,0%_100%)] lg:aspect-[1/2]"
        src="/images/dani.png"
        alt="Profile picture of Daniël Terwiel"
        width={640}
        height={640}
      />

      <div className="prose p-4 text-right sm:text-left">
        <div className="flex flex-col justify-between sm:flex-row">
          <h1 className="mb-5">Daniël Terwiel</h1>
          <div className="absolute left-3 flex flex-col justify-end gap-2 sm:relative sm:flex-row sm:pt-2 print:sm:flex-col md:pt-2">
            <Link
              href="https://github.com/danielterwiel"
              className="flex sm:order-last"
            >
              <Image
                src="/images/icons/brand-github.svg"
                aria-hidden="true"
                className="my-0 h-7 w-7 text-white opacity-60 hover:opacity-100 print:hidden sm:text-slate-800"
                alt=""
                width={24}
                height={24}
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
              <Image
                src="/images/icons/brand-linkedin.svg"
                aria-hidden="true"
                className="my-0 h-7 w-7 text-white opacity-60 hover:opacity-100 print:hidden sm:text-slate-800"
                alt=""
                width={24}
                height={24}
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
        <p>
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