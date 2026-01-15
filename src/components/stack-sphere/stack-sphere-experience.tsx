import { useMemo } from "react";

import type { Domain } from "~/types";

import { Icon } from "~/components/icon";
import { ExperienceTicker } from "~/components/stack-cloud/experience-ticker";
import { PRIMARY_COLOR } from "~/constants/colors";
import { DOMAIN_ICONS } from "~/data/icons";
import { PROJECTS } from "~/data/projects";
import { adjustExperience } from "~/utils/adjust-experience";
import { calculateDomainExperience } from "~/utils/calculate-domain-experience";
import { calculateStackExperience } from "~/utils/calculate-stack-experience";
import { calculateTotalExperience } from "~/utils/calculate-total-experience";

interface StackSphereExperienceProps {
  hoveredStack?: {
    name: string;
    iconKey: string;
  } | null;
  hoveredDomain?: Domain | null;
}

type DisplayMode = "default" | "stack" | "domain";

/**
 * Center experience display for the StackSphere
 * Shows total experience by default, stack-specific on hover
 * Reuses ExperienceTicker for animated number transitions
 */
export function StackSphereExperience({
  hoveredStack,
  hoveredDomain,
}: StackSphereExperienceProps) {
  // Determine display mode
  const displayMode: DisplayMode = hoveredStack
    ? "stack"
    : hoveredDomain
      ? "domain"
      : "default";

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

  const color = PRIMARY_COLOR;
  const iconSize = 24;

  return (
    <div className="stack-sphere-experience" style={{ color }}>
      {/* Icon and title section */}
      <div
        className="flex flex-col items-center justify-center transition-opacity duration-150"
        style={{
          minHeight: iconSize * 2.5,
          color,
        }}
      >
        {displayMode === "default" && (
          <>
            <div style={{ width: iconSize, height: iconSize }}>
              <Icon.ChartPie
                width={iconSize}
                height={iconSize}
                viewBox="0 0 24 24"
              />
            </div>
            <div
              className="font-semibold leading-tight"
              style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
            >
              Experience
            </div>
          </>
        )}

        {displayMode === "stack" && hoveredStack && (
          <>
            {Icon[hoveredStack.iconKey as keyof typeof Icon] && (
              <div style={{ width: iconSize, height: iconSize }}>
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
              className="font-semibold leading-tight"
              style={{
                fontSize: "0.875rem",
                marginTop: "0.25rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "120px",
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
                <div style={{ width: iconSize, height: iconSize }}>
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
              className="font-semibold leading-tight"
              style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
            >
              {hoveredDomain}
            </div>
          </>
        )}
      </div>

      {/* Experience ticker section */}
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "3rem" }}
      >
        {displayMode === "default" && (
          <ExperienceTicker
            key="default"
            years={totalExperience.years}
            months={totalExperience.months}
            color={color}
          />
        )}

        {displayMode === "stack" && stackExperience && (
          <ExperienceTicker
            key={`stack-${hoveredStack?.name ?? "unknown"}`}
            years={stackExperience.years}
            months={stackExperience.months}
            color={color}
          />
        )}

        {displayMode === "domain" && domainExperience && (
          <ExperienceTicker
            key={`domain-${hoveredDomain}`}
            years={domainExperience.years}
            months={domainExperience.months}
            color={color}
          />
        )}
      </div>
    </div>
  );
}
