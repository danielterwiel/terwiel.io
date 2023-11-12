import Link from "next/link";

import Header from "./components/header";
import About from "./components/about";
import Experience from "./components/experience";
import Skills from "./components/skills";
import Footer from "./components/footer";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div>
        <div className="print:h-[297mm] print:w-[221mm] print:break-after-page">
          <Header />
          <About />
        </div>
        <div className="print:h-[297mm] print:w-[221mm] print:break-after-page">
          <Experience />
        </div>
        <div className="print:h-[297mm] print:w-[221mm] print:break-after-page">
          <Skills />
          <Footer />
        </div>
      </div>
    </main>
  );
}
