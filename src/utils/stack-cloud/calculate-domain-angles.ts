import { pie } from "d3-shape";

import type { Domain, DomainAngleRange, DomainExperience } from "~/types";

/**
 * Calculate the angular range for each domain segment in the pie chart
 * Uses d3.pie() to ensure angles match the visual pie chart rendering
 *
 * @param domainExperiences - Domain experience data with percentages
 * @returns Map of domain to angular range (startAngle, endAngle, midAngle) in radians
 */
export function calculateDomainAngles(
  domainExperiences: DomainExperience[],
): Map<Domain, DomainAngleRange> {
  const angleMap = new Map<Domain, DomainAngleRange>();

  const pieGenerator = pie<DomainExperience>()
    .value((d) => d.totalMonths)
    .sort(null); // Maintain order

  // Generate pie segments
  const arcs = pieGenerator(domainExperiences);

  // Store full angular range for each segment
  for (const arc of arcs) {
    angleMap.set(arc.data.domain, {
      startAngle: arc.startAngle,
      endAngle: arc.endAngle,
      midAngle: (arc.startAngle + arc.endAngle) / 2,
    });
  }

  return angleMap;
}
