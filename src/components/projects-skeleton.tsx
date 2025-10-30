/**
 * Skeleton loader for Projects component
 * Mimics the structure of the actual project list with pulse animation
 */
export const ProjectsSkeleton = () => {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Skeleton is only shown during initial load, never rendered multiple times
    <article className="prose max-w-none" id="projects">
      <h2 className="mb-6 text-2xl font-bold md:text-center">Projects</h2>
      <div className="flow-root space-y-4 overflow-visible">
        <ol className="ml-0 list-none pl-0">
          {/* Render 3 skeleton project items */}
          {[0, 1, 2].map((idx) => (
            <ProjectItemSkeleton key={idx} isLast={idx === 2} />
          ))}
        </ol>
      </div>
    </article>
  );
};

/**
 * Individual project skeleton item
 * Matches the layout of a real Project component
 */
const ProjectItemSkeleton = ({ isLast }: { isLast: boolean }) => {
  return (
    <li className="relative break-inside-avoid-page pb-8 print:pt-8">
      {/* Vertical timeline line - extends down to connect with next circle */}
      {!isLast && (
        <span
          className="absolute top-[3rem] ml-[1.4rem] hidden h-[calc(100%-3rem+1rem)] w-0.5 bg-gray-200 md:block"
          aria-hidden="true"
        />
      )}

      <div className="flex space-x-3">
        <div className="relative grid w-full grid-cols-[2rem_minmax(0,1fr)] gap-2 md:gap-4">
          {/* Icon placeholder */}
          <div className="h-12 w-12">
            <div className="h-full w-full rounded-full bg-gray-200 animate-pulse" />
          </div>

          {/* Company name placeholder */}
          <div className="mt-2.5 pl-6">
            <div className="h-7 w-48 rounded bg-gray-200 animate-pulse" />
          </div>

          {/* Content area */}
          <div className="col-span-2 grid min-w-0 flex-1 grid-cols-1 justify-between md:pl-10">
            <div className="order-2 col-span-1">
              {/* Definition list placeholder */}
              <dl className="mt-0 md:pl-10 grid grid-flow-row grid-cols-[4rem_1fr] gap-1 pt-4 print:mt-8">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="contents">
                    <dt className="mt-0 flex gap-2 md:m-0 print:m-0">
                      <div className="h-5 w-16 rounded bg-gray-200 animate-pulse" />
                    </dt>
                    <dd className="m-0 pl-4 md:pl-7">
                      <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Description placeholder */}
              <div className="md:pl-10 space-y-2 mt-4">
                <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
              </div>

              {/* Stack badges placeholder */}
              <div className="md:pl-10 mt-4 flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-6 w-16 rounded-full bg-gray-200 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Date placeholder (absolute positioned) */}
          <div className="absolute right-0 order-first col-span-2 row-span-full pt-3 space-y-1">
            <div className="h-4 w-20 ml-auto rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-24 ml-auto rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    </li>
  );
};
