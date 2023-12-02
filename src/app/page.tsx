import Header from "~/components/header";
import About from "~/components/about";
import Experience from "~/components/experience";
import Footer from "~/components/footer";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div>
        <Header />
        <About />
      </div>
      <div className="break-inside-avoid px-4">
        <Experience />
      </div>
      <div className="px-4">
        <Footer />
      </div>
    </main>
  );
}
