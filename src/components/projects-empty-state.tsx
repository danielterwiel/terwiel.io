/**
 * Empty state component displayed when no projects match the search/filter criteria.
 *
 * ## Visual Structure:
 * ```
 * ┌─────────────────────────────────────────────────┐
 * │                                                 │
 * │              ┌─────────────────┐                │
 * │              │   🔍 Search     │                │
 * │              │     Icon        │                │
 * │              └─────────────────┘                │
 * │                                                 │
 * │         No projects found for "term"           │
 * │                                                 │
 * │    Try a different search term or clear        │
 * │    filters to browse all projects              │
 * │                                                 │
 * └─────────────────────────────────────────────────┘
 * ```
 *
 * ## Accessibility:
 * - Uses semantic heading hierarchy (h3 inside projects article)
 * - Animation respects prefers-reduced-motion
 * - Clear, descriptive text for screen readers
 * - Icon is decorative (aria-hidden)
 *
 * ## Animation:
 * - Fade-in animation on appear (300ms)
 * - Uses GPU-accelerated opacity and transform
 * - Respects prefers-reduced-motion media query
 */
import { Icon } from "~/components/icon";
import { Ring } from "~/components/ring";

interface ProjectsEmptyStateProps {
  /** The search term or filter that yielded no results */
  query: string;
}

export const ProjectsEmptyState = ({ query }: ProjectsEmptyStateProps) => {
  return (
    <output
      className="empty-state flex flex-col items-center justify-center space-y-6 py-12 md:py-16"
      aria-label={`No projects found for "${query}"`}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Decorative search icon */}
        <div className="h-16 w-16 text-slate-400">
          <Ring>
            <Icon.Search aria-hidden="true" focusable="false" />
          </Ring>
        </div>
        {/* Message content */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No projects found for "{query}"
          </h3>
          <p className="mt-2 max-w-sm text-sm text-slate-600">
            Try a different search term or clear filters to browse all projects.
          </p>
        </div>
      </div>
    </output>
  );
};
