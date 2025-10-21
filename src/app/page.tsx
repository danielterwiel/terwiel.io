import { Header } from "~/components/header";
import { Projects } from "~/components/projects";
import { StackCloud } from "~/components/stack-cloud";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen md:flex-col md:h-screen">
      <Header />
      {/* Main content area with full viewport height minus header on desktop */}
      <main className="flex-1 flex flex-col md:flex-row md:min-h-0 p-4 md:px-6 md:pt-6 md:pb-0 md:gap-0">
        {/*
          Desktop grid adjustment:
          - StackCloud: calc(50% - half of right menu width from header)
          - Projects: calc(50% + half of right menu width from header)
          This aligns the project timeline with the centered header title
        */}
        {/* StackCloud - full width on mobile, adjusted width on desktop */}
        <div className="w-full md:w-[calc(50%-1.75rem)] md:flex md:flex-col md:pb-24 lg:pb-0">
          <StackCloud />
        </div>

        {/* Projects - full width on mobile, adjusted width on desktop */}
        <div className="w-full md:w-[calc(50%+1.75rem)] md:overflow-y-auto md:min-h-0">
          <Projects />
        </div>
      </main>
    </div>
  );
}
