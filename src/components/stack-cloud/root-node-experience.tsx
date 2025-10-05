import { useMemo } from "react";

import type { Domain } from "~/data/projects";
import type { Dimensions } from "~/types/simulation";
import { Icon } from "~/components/icon";
import { PRIMARY_COLOR } from "~/constants/colors";
import { DOMAIN_ICONS } from "~/data/icons";
import { PROJECTS } from "~/data/projects";
import { calculateDomainExperience } from "~/utils/calculate-domain-experience";
import { calculateStackExperience } from "~/utils/calculate-stack-experience";
import { calculateTotalExperience } from "~/utils/calculate-total-experience";
import { countProjectsByDomain } from "~/utils/count-projects-by-domain";
import { countProjectsByStack } from "~/utils/count-projects-by-stack";
import { ExperienceTicker } from "./experience-ticker";

interface RootNodeExperienceProps {
  dimensions: Dimensions;
  hoveredStack?: {
    name: string;
    iconKey: string;
    color: string;
    domain: Domain;
  } | null;
  hoveredDomain?: Domain | null;
  hoveredStackId?: string | null;
}

type DisplayMode = "default" | "stack" | "domain";

/**
 * Component that displays dynamic experience information in the center of the root node
 * Shows different content based on hover state (stack, domain, or default)
 */
export function RootNodeExperience({
  dimensions,
  hoveredStack,
  hoveredDomain,
  hoveredStackId,
}: RootNodeExperienceProps) {
  // Determine display mode: active hover (stack or domain) overrides selected
  // Priority: active stack hover > domain hover > selected stack > default
  const displayMode: DisplayMode = hoveredStackId
    ? "stack" // Actively hovering a stack
    : hoveredDomain
      ? "domain" // Hovering a domain segment
      : hoveredStack
        ? "stack" // Selected stack (not actively hovered)
        : "default";

  // Calculate total experience
  const totalExperience = useMemo(() => calculateTotalExperience(PROJECTS), []);

  // Calculate stack-specific experience
  const stackExperience = useMemo(() => {
    if (!hoveredStack) return null;
    return calculateStackExperience(PROJECTS, hoveredStack.name);
  }, [hoveredStack]);

  // Calculate domain-specific experience
  const domainExperience = useMemo(() => {
    if (!hoveredDomain) return null;
    return calculateDomainExperience(PROJECTS, hoveredDomain);
  }, [hoveredDomain]);

  // Count projects
  const projectCount = useMemo(() => {
    if (hoveredStack) {
      return countProjectsByStack(PROJECTS, hoveredStack.name);
    }
    if (hoveredDomain) {
      return countProjectsByDomain(PROJECTS, hoveredDomain);
    }
    return 0;
  }, [hoveredStack, hoveredDomain]);

  // Mobile-first font sizing with minimum threshold - reduced by 20%
  const baseFontSize = Math.max(9.6, dimensions.rootRadius * 0.144);
  const iconSize = Math.max(16, dimensions.rootRadius * 0.24);

  // Get color based on mode
  const color = PRIMARY_COLOR;

  return (
    <foreignObject
      x={-dimensions.rootRadius * 0.8}
      y={-dimensions.rootRadius * 0.6}
      width={dimensions.rootRadius * 1.6}
      height={dimensions.rootRadius * 1.2}
      style={{ overflow: "visible", pointerEvents: "none" }}
    >
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-1"
        style={{
          fontSize: baseFontSize,
          textShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
          position: "fixed",
        }}
      >
        {/* Container 1: Title/Icon */}
        <div
          className="flex w-full flex-col items-center justify-center transition-all duration-300"
          style={{
            minHeight: iconSize * 1.5,
            maxWidth: "100%",
            color,
          }}
        >
          {displayMode === "default" && (
            <>
              <div
                style={{
                  width: iconSize,
                  height: iconSize,
                  color,
                  filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))",
                }}
              >
                <Icon.ChartPie
                  width={iconSize}
                  height={iconSize}
                  viewBox="0 0 24 24"
                />
              </div>
              <div
                className="text-center font-semibold leading-tight"
                style={{
                  fontSize: "0.76em",
                  marginTop: "0.25em",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                }}
              >
                Experience
              </div>
            </>
          )}

          {displayMode === "stack" && hoveredStack && (
            <>
              {Icon[hoveredStack.iconKey as keyof typeof Icon] && (
                <div
                  style={{
                    width: iconSize,
                    height: iconSize,
                    color,
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))",
                  }}
                >
                  {(() => {
                    const IconComponent =
                      Icon[hoveredStack.iconKey as keyof typeof Icon];
                    return IconComponent ? (
                      <IconComponent
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                      />
                    ) : null;
                  })()}
                </div>
              )}
              <div
                className="text-center font-semibold leading-tight"
                style={{
                  fontSize: "0.76em",
                  marginTop: "0.25em",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
                {hoveredStack.name}
              </div>
            </>
          )}

          {displayMode === "domain" && hoveredDomain && (
            <>
              {DOMAIN_ICONS[hoveredDomain] &&
                Icon[DOMAIN_ICONS[hoveredDomain] as keyof typeof Icon] && (
                  <div
                    style={{
                      width: iconSize,
                      height: iconSize,
                      color,
                      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))",
                    }}
                  >
                    {(() => {
                      const IconComponent =
                        Icon[DOMAIN_ICONS[hoveredDomain] as keyof typeof Icon];
                      return IconComponent ? (
                        <IconComponent
                          width={iconSize}
                          height={iconSize}
                          viewBox="0 0 24 24"
                        />
                      ) : null;
                    })()}
                  </div>
                )}
              <div
                className="text-center font-semibold leading-tight"
                style={{
                  fontSize: "0.76em",
                  marginTop: "0.25em",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                }}
              >
                {hoveredDomain}
              </div>
            </>
          )}
        </div>

        {/* Container 2: Years/Months with ticker animation */}
        <div
          className="flex w-full items-center justify-center transition-all duration-300"
          style={{
            minHeight: baseFontSize * 2.2,
            maxWidth: "100%",
          }}
        >
          {displayMode === "default" && (
            <ExperienceTicker
              years={totalExperience.years}
              months={totalExperience.months}
              color={color}
            />
          )}

          {displayMode === "stack" && stackExperience && (
            <ExperienceTicker
              years={stackExperience.years}
              months={stackExperience.months}
              color={color}
            />
          )}

          {displayMode === "domain" && domainExperience && (
            <ExperienceTicker
              years={domainExperience.years}
              months={domainExperience.months}
              color={color}
            />
          )}
        </div>

        {/* Container 3: Project count (muted) */}
        <div
          className="flex w-full items-center justify-center transition-all duration-300"
          style={{
            minHeight: baseFontSize * 1.5,
            maxWidth: "100%",
            opacity: displayMode !== "default" ? 0.5 : 0,
            color,
          }}
        >
          {displayMode !== "default" && (
            <div
              className="text-center leading-tight"
              style={{
                fontSize: "0.75em",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)",
                whiteSpace: "nowrap",
              }}
            >
              {projectCount} {projectCount === 1 ? "project" : "projects"}
            </div>
          )}
        </div>
      </div>
    </foreignObject>
  );
}
