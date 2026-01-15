/**
 * Domain categories for grouping technologies in the stack visualization.
 *
 * Each domain represents a distinct area of software development expertise:
 * - **Front-end**: UI frameworks, JavaScript/TypeScript, build tools
 * - **Back-end**: Server-side languages, databases, APIs
 * - **DevOps**: CI/CD, containerization, shell scripting
 * - **Design**: CSS frameworks, design tools, styling
 * - **QA**: Testing frameworks and tools
 * - **AI**: AI-assisted development tools
 *
 * The visualization uses OKLCH color space for each domain to ensure
 * perceptually uniform colors. See `src/constants/colors.ts` for values.
 *
 * Domain ordering in the UI is based on total experience (months worked
 * with technologies in that domain), sorted descending.
 */
export type Domain =
  | "DevOps"
  | "Back-end"
  | "Front-end"
  | "Design"
  | "QA"
  | "AI";

/**
 * Props for badge components (used in project cards).
 */
export type BadgeProps = {
  icon: string;
  name: string;
};

/**
 * Represents a technology used in a project.
 *
 * This is the "instance" of a technology within a project context,
 * while `Stack` in stack.ts is the "definition" of the technology.
 *
 * StackItems are created via `createStackItem()` in `src/data/projects.ts`,
 * which pulls metadata from the central STACK registry.
 */
export type StackItem = {
  /** Display name (e.g., "React", "TypeScript") */
  name: string;

  /** Parent technology name for hierarchical grouping (optional) */
  parent?: string;

  /** Domain category for visual grouping */
  domain: Domain;

  /** Icon component key from icons.ts */
  icon: string;

  /** Optional URL for the technology (rarely used) */
  url?: string;
};

/**
 * Represents a work project or experience entry.
 *
 * Projects are the primary data source for:
 * 1. The experience/portfolio section (rendered as cards)
 * 2. The stack visualization (extracts unique stacks from all projects)
 * 3. Domain experience calculation (weighted by project duration)
 *
 * @see src/data/projects.ts - Project data definitions
 * @see src/components/projects.tsx - Project list rendering
 */
export type Project = {
  /** Unique identifier (e.g., "PROJECT_1", "PROJECT_2") */
  id: string;

  /** Company or organization name */
  company: string;

  /** Job title or role */
  role: string;

  /** Team size (number of people) */
  teamSize: number;

  /** Industry or sector (e.g., "Finance", "E-commerce") */
  industry: string;

  /** Work location (city, country, or "Remote") */
  location: string;

  /** Start date in ISO format (YYYY-MM-DD) */
  dateFrom: string;

  /** End date in ISO format, or "Present" for current roles */
  dateTo: string;

  /** Project/role description (rendered as text) */
  description: string;

  /** Technologies used in this project */
  stack: StackItem[];

  /** Company/project logo icon key */
  icon: string;

  /** Optional link to company/project website */
  url?: string;

  /** True for personal/side projects (displayed with badge) */
  sideProject?: boolean;
};
