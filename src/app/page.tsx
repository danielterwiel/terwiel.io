import { Header } from "~/components/header";
import { Projects } from "~/components/projects";
import { StackCloud } from "~/components/stack-cloud";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen overflow-visible">
      <Header />
      {/* Main content area with full viewport height minus header on desktop */}
      <main className="flex-1 flex flex-col md:flex-row landscape-mobile:flex-col p-4 md:px-6 md:pt-6 md:pb-0 md:gap-0 landscape-mobile:px-2 landscape-mobile:pt-0 landscape-mobile:pb-0 relative z-0 overflow-visible md:min-h-0">
        {/*
          Desktop layout adjustment:
          - StackCloud: calc(50% - half of right menu width from header)
          - Projects: calc(50% + half of right menu width from header)
          This aligns the project timeline with the centered header title

          Z-index hierarchy:
          - StackCloud: z-0 (default)
          - Projects: z-10 (above StackCloud on mobile)
          - View transitions for projects: z-20 (handled in CSS)
          - Header: z-50 (sticky, above everything)
        */}
        {/* StackCloud - full width on mobile, fixed on desktop */}
        <div className="w-full md:w-[calc(50%-1.75rem)] landscape-mobile:w-full md:flex landscape-mobile:block md:flex-col md:h-[calc(100vh-72px)] landscape-mobile:h-auto relative z-0 md:fixed landscape-mobile:relative md:top-[72px] md:left-0 pt-8 landscape-mobile:pt-0">
          <StackCloud />
        </div>

        {/* Projects - full width on mobile, adjusted width on desktop */}
        <div className="w-full md:w-[calc(50%+1.75rem)] landscape-mobile:w-full landscape-mobile:overflow-visible md:min-h-0 landscape-mobile:min-h-auto relative z-10 pt-8 landscape-mobile:pt-16 md:ml-[calc(50%-1.75rem)] landscape-mobile:ml-0 landscape-mobile:min-h-auto">
          <Projects />
        </div>
      </main>
    </div>
  );
}
