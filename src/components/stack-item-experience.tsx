import clsx from "clsx";

import { PROJECTS } from "~/data/projects";
import { calculateStackExperience } from "~/utils/calculate-experience";
import { getIconColorClass } from "~/utils/icon-colors";

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

interface StackItemExperienceProps {
  hoveredNode: IconNode | null;
  selectedNode: IconNode | null;
}

export const StackItemExperience: React.FC<StackItemExperienceProps> = ({
  hoveredNode,
  selectedNode,
}) => {
  const displayNode = hoveredNode || selectedNode;

  const colorClass = displayNode ? getIconColorClass(displayNode.icon) : "";

  return (
    <div className="w-full h-32">
      <div className={clsx(colorClass)}>{displayNode?.name || ""}</div>

      <div className="text-lg text-gray-500">
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
  );
};
