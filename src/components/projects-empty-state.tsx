import { Icon } from "~/components/icon";
import { Ring } from "~/components/ring";

export const ProjectsEmptyState = ({ query }: { query: string }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12 md:py-16">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-16 w-16 text-slate-400">
          <Ring>
            <Icon.Search aria-hidden="true" focusable="false" />
          </Ring>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No projects found
          </h3>
          <p className="mt-2 max-w-sm text-sm text-slate-600">
            No projects match <span className="font-medium">"{query}"</span>.
            Try a different search term or browse all projects by clearing the
            search.
          </p>
        </div>
      </div>
    </div>
  );
};
