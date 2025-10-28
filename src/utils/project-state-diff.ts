import type { Project } from "~/types";

export type ProjectState = "exit" | "enter" | "stay";

export interface ProjectWithState {
  project: Project;
  state: ProjectState;
}

/**
 * Determines the state of each project by comparing previous and current filtered lists
 * States:
 * - "exit": Project was visible before but is filtered out now
 * - "enter": Project was not visible before but is now
 * - "stay": Project was visible and remains visible (may have changed position)
 */
export function diffProjectStates(
  prevFiltered: Project[],
  nextFiltered: Project[],
): Map<string, ProjectState> {
  const stateMap = new Map<string, ProjectState>();

  // Get sets of IDs for easy lookup
  const prevIds = new Set(prevFiltered.map((p) => p.id));
  const nextIds = new Set(nextFiltered.map((p) => p.id));

  // Mark projects that are exiting
  for (const project of prevFiltered) {
    if (!nextIds.has(project.id)) {
      stateMap.set(project.id, "exit");
    }
  }

  // Mark projects that are entering or staying
  for (const project of nextFiltered) {
    if (!prevIds.has(project.id)) {
      stateMap.set(project.id, "enter");
    } else {
      stateMap.set(project.id, "stay");
    }
  }

  return stateMap;
}
