const Stack = () => {
  return (
    <>
      <h2>Stack</h2>
      <ul>
        <li>HTML</li>
        <li>CSS</li>
        <li>JavaScript</li>
        <li>TypeScript</li>
        <li>React</li>
        <li>Vue</li>
        <li>Rust</li>
      </ul>
    </>
  );
};

const Focus = () => {
  return (
    <>
      <h2>Focus</h2>
      <ul>
        <li>Communication</li>
        <li>Architecture</li>
        <li>Performance</li>
        <li>Accessibility</li>
      </ul>
    </>
  );
};

export default function About() {
  return (
    <aside>
      <p className="p-4">
        As a web developer with over 15 years of experience, I bring a wealth of
        knowledge and a track record of success in various environments, from
        startups to hypergrowth scale-ups to enterprise. My expertise extends
        beyond coding, focusing on creating user-centric web experiences that
        drive engagement and growth. My career spans the evolving landscape of
        web technologies, blending technical prowess with strategic insight.
        Adaptability and problem-solving in diverse settings have honed my
        skills, making me an asset to teams aiming for impactful digital
        innovations.
      </p>
      <div>
        <Stack />
        <Focus />
      </div>
    </aside>
  );
}
