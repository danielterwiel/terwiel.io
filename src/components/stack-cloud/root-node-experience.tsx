import { useMemo, useRef } from "react";

import type { Dimensions, Domain } from "~/types";

import { Icon } from "~/components/icon";
import { PRIMARY_COLOR } from "~/constants/colors";
import { DOMAIN_ICONS } from "~/data/icons";
import { PROJECTS } from "~/data/projects";
import { adjustExperience } from "~/utils/adjust-experience";
import { calculateDomainExperience } from "~/utils/calculate-domain-experience";
import { calculateStackExperience } from "~/utils/calculate-stack-experience";
import { calculateTotalExperience } from "~/utils/calculate-total-experience";
import { ExperienceTicker } from "./experience-ticker";

interface RootNodeExperienceProps {
  dimensions: Dimensions;
  hoveredStack?: {
    id: string;
    name: string;
    iconKey: string;
    color: string;
    domain: Domain;
  } | null;
  hoveredDomain?: Domain | null;
  isActiveHover?: boolean;
  isInitialAnimating?: boolean;
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
  isActiveHover = false,
  isInitialAnimating = false,
}: RootNodeExperienceProps) {
  // Determine display mode: active hover (stack or domain) overrides selected
  // Priority: active stack hover > domain hover > selected stack > default
  const displayMode: DisplayMode = isActiveHover
    ? "stack" // Actively hovering a stack
    : hoveredDomain
      ? "domain" // Hovering a domain segment
      : hoveredStack
        ? "stack" // Selected stack (not actively hovered)
        : "default";

  // Track the initial display mode to know which ticker should animate on first render
  const initialDisplayModeRef = useRef<DisplayMode | null>(null);
  if (initialDisplayModeRef.current === null && isInitialAnimating) {
    initialDisplayModeRef.current = displayMode;
  }

  // Determine if we should show initial animation for current display mode
  // Animate if: pie is animating AND current mode matches the initial mode
  const shouldAnimateInitially =
    isInitialAnimating && displayMode === initialDisplayModeRef.current;

  // Calculate total experience
  const totalExperience = useMemo(
    () => adjustExperience(calculateTotalExperience(PROJECTS)),
    [],
  );

  // Calculate stack-specific experience
  const stackExperience = useMemo(() => {
    if (!hoveredStack) return null;
    return adjustExperience(
      calculateStackExperience(PROJECTS, hoveredStack.name),
    );
  }, [hoveredStack]);

  // Calculate domain-specific experience
  const domainExperience = useMemo(() => {
    if (!hoveredDomain) return null;
    return adjustExperience(calculateDomainExperience(PROJECTS, hoveredDomain));
  }, [hoveredDomain]);

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
          position: "fixed",
          // Prevent text selection on rapid clicks while keeping keyboard focus accessible
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
        }}
      >
        {/* Container 1: Title/Icon */}
        <div
          className="flex w-full flex-col items-center justify-start transition-all duration-150"
          style={{
            minHeight: iconSize * 2,
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
                }}
                aria-hidden="true"
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
                  fontSize: "1em",
                  marginTop: "0.25em",
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
                  }}
                  aria-hidden="true"
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
                  fontSize: "1em",
                  marginTop: "0.25em",
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
                    }}
                    aria-hidden="true"
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
                  fontSize: "1em",
                  marginTop: "0.25em",
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
            minHeight: baseFontSize * 2.95,
            maxWidth: "100%",
          }}
        >
          {displayMode === "default" && (
            <ExperienceTicker
              key="default"
              years={totalExperience.years}
              months={totalExperience.months}
              color={color}
              isInitialAnimating={shouldAnimateInitially}
            />
          )}

          {displayMode === "stack" && stackExperience && (
            <ExperienceTicker
              key={`stack-${hoveredStack?.id ?? "unknown"}`}
              years={stackExperience.years}
              months={stackExperience.months}
              color={color}
              isInitialAnimating={shouldAnimateInitially}
            />
          )}

          {displayMode === "domain" && domainExperience && (
            <ExperienceTicker
              key={`domain-${hoveredDomain}`}
              years={domainExperience.years}
              months={domainExperience.months}
              color={color}
              isInitialAnimating={shouldAnimateInitially}
            />
          )}
        </div>
      </div>
    </foreignObject>
  );
}
