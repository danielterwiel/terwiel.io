import type { StackName } from "./icon";
import type { Domain } from "./project";

export type Stack = {
  id: string; // Normalized slug: "react", "typescript", "tanstack"
  name: StackName; // Display name: "React", "TypeScript", "Tanstack"
  iconKey: string; // Icon key: "BrandReact", "BrandTypescript"
  color: string; // Hex: "#61DAFB", "#3178C6"
  domain: Domain; // "Front-end", "Back-end", "DevOps", "Design"
  parent?: string; // Optional parent (e.g., "Tanstack")
  children?: string[]; // Child stack names if this is a parent
};
