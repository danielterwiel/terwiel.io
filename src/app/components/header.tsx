import Image from "next/image";

export default function Header() {
  return (
    <header>
      <Image
        className="float-left mb-0 mr-2 aspect-[1/1] 
          w-64 object-cover object-center shadow-lg [clip-path:circle(70%_at_20%_30%)] 
          [shape-outside:circle(70%_at_20%_30%)] 
          md:[clip-path:polygon(0%_0%,100%_0%,75%_100%,0%_100%)]
          md:[shape-outside:polygon(0%_0%,100%_0%,75%_100%,0%_100%)]
          lg:aspect-[1/2] "
        src="/images/dani.png"
        alt="Profile picture of Daniel Terwiel"
        width={640}
        height={640}
      />

      <div className="prose p-2">
        <h1 className="truncate">Developer</h1>
        <h2>Daniel Terwiel</h2>

        <p>
          As a web developer with over 15 years of experience, I bring a wealth
          of knowledge and a track record of success in various environments,
          from startups to hypergrowth scale-ups to enterprise. My expertise
          extends beyond coding, focusing on creating user-centric web
          experiences that drive engagement and growth. My career spans the
          evolving landscape of web technologies, blending technical prowess
          with strategic insight. Adaptability and problem-solving in diverse
          settings have honed my skills, making me an asset to teams aiming for
          impactful digital innovations.
        </p>
      </div>
    </header>
  );
}
