import Image from "next/image";

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
        <h1>Daniël Terwiel</h1>
      </div>
    </header>
  );
}
