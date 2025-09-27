import Contact from "~/components/contact";
import Experience from "~/components/experience";
import Footer from "~/components/footer";
import { IconCloud } from "~/components/icon-cloud";
import { SearchInput } from "~/components/search";

export default function HomePage() {
  return (
    <div className="flex justify-center">
      <main className="flex min-h-screen max-w-xl flex-col print:m-0 a4-page prose pt-8 w-full">
        <div className="px-4">
          <SearchInput />
          <IconCloud />
        </div>
        <div className="break-inside-avoid px-4">
          <Experience />
        </div>
        <div className="break-inside-avoid px-4">
          <Contact />
          <Footer />
        </div>
      </main>
    </div>
  );
}
