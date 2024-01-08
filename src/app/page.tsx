// "use client";

// import React from "react";

import Header from "~/components/header";
import About from "~/components/about";
import Experience from "~/components/experience";
import Contact from "~/components/contact";
import Footer from "~/components/footer";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col print:m-0">
      <div>
        <Header />
        <About />
      </div>
      <div className="break-inside-avoid px-4">
        <Experience />
      </div>
      <div className="break-inside-avoid px-4">
        <Contact />
        <Footer />
      </div>
    </main>
  );
}
