import { Header } from "~/components/header";
import { Projects } from "~/components/projects";
import { StackCloud } from "~/components/stack-cloud";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        {/* Mobile: Single column layout */}
        {/* Desktop (md+): 2-column grid - cloud takes ~60%, projects takes ~40% */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5 md:gap-8">
          {/* StackCloud - full width on mobile, 3 columns (60%) on desktop */}
          <div className="md:col-span-3">
            <StackCloud />
          </div>

          {/* Projects - full width on mobile, 2 columns (40%) on desktop */}
          <div className="md:col-span-2">
            <Projects />
          </div>
        </div>
      </main>
    </div>
  );
}
