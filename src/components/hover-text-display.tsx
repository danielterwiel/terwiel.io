import { clsx } from "clsx";

import { useEffect, useState } from "react";

import { ICON_COLORS } from "~/data/icon-colors";
import { PROJECTS } from "~/data/projects";
import { calculateStackExperience } from "~/utils/calculate-experience";

type IconNode = {
  id: string;
  name: string;
  icon: string;
  url: string;
  r: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  group: number;
  isHovered?: boolean;
};

interface HoverTextDisplayProps {
  hoveredNode: IconNode | null;
  selectedNode: IconNode | null;
}

export const HoverTextDisplay: React.FC<HoverTextDisplayProps> = ({
  hoveredNode,
  selectedNode,
}) => {
  const [debouncedHoveredNode, setDebouncedHoveredNode] =
    useState<IconNode | null>(null);

  // Debounce hover changes to prevent disco effect
  useEffect(() => {
    if (hoveredNode) {
      // Small delay to prevent rapid flickering
      const timer = setTimeout(() => {
        setDebouncedHoveredNode(hoveredNode);
      }, 50); // Shorter delay for responsiveness

      return () => clearTimeout(timer);
    } else {
      // Moderate delay when clearing hover to prevent flickering
      const timer = setTimeout(() => {
        setDebouncedHoveredNode(null);
      }, 200); // Moderate delay for calmer behavior

      return () => clearTimeout(timer);
    }
  }, [hoveredNode]);

  // Determine which node to display: hovered node takes priority, then selected
  const displayNode = debouncedHoveredNode || selectedNode;

  return (
    <div className="h-32">
      <div className="relative w-full flex flex-col items-center mt-8 overflow-hidden">
        {/* Stack name with fixed height container */}
        <div className="h-20 flex items-center justify-center w-full max-w-4xl px-8">
          <div
            className={clsx(
              "relative font-bold text-center whitespace-nowrap leading-none transition-all duration-500 ease-in-out transform w-full px-8 py-4 rounded-full",
              displayNode
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4",
            )}
            style={{
              color: displayNode
                ? ICON_COLORS[displayNode?.icon as keyof typeof ICON_COLORS]
                    ?.replace("text-[", "")
                    .replace("]", "") || "#6b7280"
                : "#6b7280",
              fontSize: displayNode
                ? `clamp(1.5rem, ${Math.min(12, Math.max(3, 50 / displayNode.name.length))}vw, 4rem)`
                : "4rem",
              textShadow: displayNode
                ? debouncedHoveredNode
                  ? "0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)"
                  : "0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)"
                : "none",
              background: displayNode
                ? (() => {
                    const baseColor =
                      ICON_COLORS[displayNode?.icon as keyof typeof ICON_COLORS]
                        ?.replace("text-[", "")
                        .replace("]", "") || "#6b7280";

                    // Convert hex to rgb for proper alpha handling
                    const hex = baseColor.replace("#", "");
                    const r = parseInt(hex.substring(0, 2), 16);
                    const g = parseInt(hex.substring(2, 4), 16);
                    const b = parseInt(hex.substring(4, 6), 16);

                    // Use stronger background for hover, subtler for selected
                    const intensity = debouncedHoveredNode ? 0.2 : 0.1;
                    return `radial-gradient(circle at center, rgba(${r}, ${g}, ${b}, ${intensity}) 0%, rgba(${r}, ${g}, ${b}, ${intensity / 2}) 30%, rgba(${r}, ${g}, ${b}, ${intensity / 4}) 60%, transparent 80%)`;
                  })()
                : "transparent",
            }}
          >
            {displayNode?.name || ""}
          </div>
        </div>

        {/* Experience duration */}
        {displayNode && <div className="text-gray-400 pt-4">Experience:</div>}
        <div
          className={`text-lg text-gray-500 mt-2 transition-all duration-500 ease-in-out transform ${
            displayNode
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
          style={{
            transitionDelay: displayNode ? "100ms" : "0ms", // Slight delay for staggered animation
          }}
        >
          {displayNode &&
            (() => {
              const experience = calculateStackExperience(PROJECTS).find(
                (exp) => exp.name === displayNode.name,
              );
              if (experience) {
                const parts = [];
                if (experience.years > 0) {
                  parts.push(
                    `${experience.years} year${experience.years > 1 ? "s" : ""}`,
                  );
                }
                if (experience.months > 0) {
                  parts.push(
                    `${experience.months} month${experience.months > 1 ? "s" : ""}`,
                  );
                }
                return parts.join(" ") || "< 1 month";
              }
              return "";
            })()}
        </div>
      </div>
    </div>
  );
};
