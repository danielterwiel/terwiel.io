import Contact from "~/components/contact";
import Experience from "~/components/experience";
import Footer from "~/components/footer";
import { SearchInput } from "~/components/search-input";

export default function HomePage() {
  return (
    <div className="flex justify-center">
      <main className="flex min-h-screen max-w-xl p-4 flex-col print:m-0 a4-page prose w-full">
        <SearchInput />
        <Experience />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}
