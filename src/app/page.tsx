import Header from "./components/header";
import About from "./components/about";
import Experience from "./components/experience";
import Footer from "./components/footer";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="break-after-page print:max-h-[297mm] print:max-w-[210mm]">
        <Header />
        <About />
      </div>
      <div className="px-4">
        <Experience />
      </div>
      <div className="px-4">
        <Footer />
      </div>
    </main>
  );
}
