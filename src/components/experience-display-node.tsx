"use client";

import clsx from "clsx";

import { useEffect, useState } from "react";

import type { Domain } from "~/data/projects";
import type { IconNode } from "~/types/icon-node";
import { DomainPieChart } from "~/components/domain-pie-chart";
import { Icon } from "~/components/icon";
import { PROJECTS } from "~/data/projects";
import { calculateStackExperience } from "~/utils/calculate-experience";
import { extractUniqueIcons } from "~/utils/extract-unique-icons";
import { getIconColorClass, getMagneticClasses } from "~/utils/icon-colors";

interface ExperienceDisplayNodeProps {
  selectedNode: IconNode | null;
  hoveredNode: IconNode | null;
  className?: string;
  onDomainHover?: (domain: Domain | null) => void;
  isMobile?: boolean;
}

type DisplayState = {
  title: string;
  experience: string;
  subtitle?: string;
};

export const ExperienceDisplayNode: React.FC<ExperienceDisplayNodeProps> = ({
  selectedNode,
  hoveredNode,
  className,
  onDomainHover,
  isMobile = false,
}) => {
  const [displayState, setDisplayState] = useState<DisplayState>({
    title: "Global Stats",
    experience: "Explore the cloud",
    subtitle: "Hover or click on technologies",
  });
  const [isHovered, setIsHovered] = useState(false);
  const displayNode =
    (hoveredNode?.id !== "experience-display" ? hoveredNode : null) ||
    (selectedNode?.id !== "experience-display" ? selectedNode : null);

  useEffect(() => {
    if (displayNode) {
      const experience = calculateStackExperience(PROJECTS).find(
        (exp) => exp.name === displayNode.name,
      );

      // Use parent name if available, otherwise use the node name
      const displayName = displayNode.parent ?? displayNode.name;

      if (experience) {
        setDisplayState({
          title: displayName,
          experience:
            experience.years > 0 || experience.months > 0
              ? "" // Will be rendered separately
              : "< 1 month",
          subtitle: `${experience.projects.length} project${experience.projects.length > 1 ? "s" : ""}`,
        });
      } else {
        setDisplayState({
          title: displayName,
          experience: "New technology",
          subtitle: "Not yet used in projects",
        });
      }
    } else {
      // Count actual nodes (excluding the experience display node itself)
      const nodes = extractUniqueIcons(PROJECTS, 800, 800);
      const totalTools = nodes.length;

      // Calculate actual years of experience based on project durations
      const totalProjectMonths = PROJECTS.reduce((sum, project) => {
        const from = new Date(project.dateFrom);
        const to =
          project.dateTo === "present" ? new Date() : new Date(project.dateTo);
        const months =
          (to.getFullYear() - from.getFullYear()) * 12 +
          (to.getMonth() - from.getMonth());
        return sum + months;
      }, 0);
      const totalYears = Math.floor(totalProjectMonths / 12);
      const totalProjects = PROJECTS.length;

      setDisplayState({
        title: "Experience",
        experience: `~${totalYears} years`,
        subtitle: `using ${totalTools} tools across ${totalProjects} projects`,
      });
    }
  }, [displayNode]);

  const experience = displayNode
    ? calculateStackExperience(PROJECTS).find(
        (exp) => exp.name === displayNode.name,
      )
    : null;

  return (
    <div
      className={clsx(
        "experience-display-node flex flex-col items-center justify-center",
        "text-center transition-all duration-300 ease-out",
        "w-full h-full",
        isMobile ? "gap-1" : "gap-3",
        getMagneticClasses(undefined, {
          component: "card",
          shape: "rounded-full",
          withRing: false,
          variant: "base",
        }),
        className,
      )}
    >
      {/* Default State: Show Domain Pie Chart with Experience Overlay */}
      {!displayNode && (
        <section
          aria-label="Experience statistics and domain distribution"
          className="relative flex items-center justify-center w-full h-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <DomainPieChart
            size={isMobile ? 120 : 180}
            onDomainHover={onDomainHover}
          />

          {/* Experience Stats Overlay - Hidden on Hover */}
          <div
            className={clsx(
              "absolute inset-0 flex flex-col items-center justify-center pointer-events-none",
              "transition-opacity duration-300",
              isHovered ? "opacity-0" : "opacity-100",
            )}
          >
            {/* Subtle semi-transparent background for readability */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.65) 50%, rgba(255, 255, 255, 0.4) 100%)",
                backdropFilter: "blur(4px)",
              }}
            />

            {/* Text content with reduced prominence */}
            <div className="relative z-10 flex flex-col items-center gap-0.5">
              {/* Title - smaller and more subtle */}
              <div
                className={clsx(
                  "font-semibold text-gray-700",
                  isMobile ? "text-sm mb-0" : "text-lg mb-1",
                )}
              >
                {displayState.title}
              </div>

              {/* Years/Months Display - more compact */}
              {(() => {
                const totalProjectMonths = PROJECTS.reduce((sum, project) => {
                  const from = new Date(project.dateFrom);
                  const to =
                    project.dateTo === "present"
                      ? new Date()
                      : new Date(project.dateTo);
                  const months =
                    (to.getFullYear() - from.getFullYear()) * 12 +
                    (to.getMonth() - from.getMonth());
                  return sum + months;
                }, 0);
                const years = Math.floor(totalProjectMonths / 12);
                const months = totalProjectMonths % 12;

                return (
                  <div className="flex flex-col items-center">
                    {years > 0 && (
                      <div
                        className={clsx(
                          "font-bold text-klein",
                          isMobile ? "text-lg" : "text-2xl",
                        )}
                      >
                        {years} year{years > 1 ? "s" : ""}
                      </div>
                    )}
                    {months > 0 && (
                      <div
                        className={clsx(
                          "font-semibold text-klein/70",
                          isMobile ? "text-xs" : "text-base",
                        )}
                      >
                        {months} month{months > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      {/* Selected/Hovered State: Show Tech Info */}
      {displayNode && (
        <>
          {/* Icon and Title Section */}
          <div
            className={clsx(
              "flex flex-col items-center justify-center",
              isMobile ? "gap-1" : "gap-2",
            )}
          >
            {(() => {
              const IconComponent = Icon[displayNode.icon as keyof typeof Icon];
              return IconComponent ? (
                <IconComponent
                  className={clsx(
                    getIconColorClass(displayNode.icon),
                    isMobile
                      ? "w-4 h-4 mb-0 scale-125"
                      : "w-6 h-6 mb-2 scale-150",
                  )}
                />
              ) : null;
            })()}
            <div
              className={clsx(
                "font-semibold text-center text-gray-900 leading-tight",
                isMobile ? "text-base" : "text-2xl",
              )}
            >
              {displayState.title}
            </div>
          </div>

          {/* Experience Duration Section */}
          <div className="flex flex-col items-center justify-center">
            {experience && (experience.years > 0 || experience.months > 0) ? (
              experience.years > 0 && experience.months > 0 ? (
                // Both years and months - two lines
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={clsx(
                      "font-bold text-klein",
                      isMobile ? "text-base" : "text-2xl",
                    )}
                  >
                    {experience.years} year{experience.years > 1 ? "s" : ""}
                  </div>
                  <div
                    className={clsx(
                      "font-semibold text-klein/70",
                      isMobile ? "text-xs" : "text-lg",
                    )}
                  >
                    {experience.months} month{experience.months > 1 ? "s" : ""}
                  </div>
                </div>
              ) : experience.years > 0 ? (
                <div
                  className={clsx(
                    "font-bold text-klein",
                    isMobile ? "text-base" : "text-2xl",
                  )}
                >
                  {experience.years} year{experience.years > 1 ? "s" : ""}
                </div>
              ) : (
                <div
                  className={clsx(
                    "font-bold text-klein",
                    isMobile ? "text-base" : "text-2xl",
                  )}
                >
                  {experience.months} month{experience.months > 1 ? "s" : ""}
                </div>
              )
            ) : (
              <div
                className={clsx(
                  "font-bold text-klein",
                  isMobile ? "text-base" : "text-2xl",
                )}
              >
                {displayState.experience}
              </div>
            )}
          </div>

          {/* Subtitle Section */}
          <div
            className={clsx(
              "text-gray-600 text-center",
              isMobile ? "text-xs" : "text-sm",
            )}
          >
            {displayState.subtitle || "\u00A0"}
          </div>
        </>
      )}
    </div>
  );
};
