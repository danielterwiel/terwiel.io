import type { Domain, StackName } from "~/types";

import { STACK_ICONS } from "./icons";

/**
 * Central registry of all technology stacks used across projects.
 *
 * ## Structure
 *
 * Each entry is keyed by the display name (StackName) and contains:
 * - `domain`: Category for visual grouping (Front-end, Back-end, etc.)
 * - `icon`: SVG icon key from STACK_ICONS
 * - `parent`: (optional) Parent technology for hierarchical grouping
 *
 * ## Hierarchical Relationships
 *
 * Some technologies form parent-child relationships:
 * - **Tanstack** → Tanstack Query, Tanstack Router, Tanstack Start, Tanstack DB
 * - **Redux** → Redux-saga
 * - **SQL** → SQL Server
 * - **React** → Preact
 *
 * The visualization merges children with their parent, showing only the parent
 * node. This is handled by `extractUniqueStacks()` in `src/utils/extract-stacks.ts`.
 *
 * ## Usage
 *
 * Projects reference stacks by name via `createStackItem(stackName)`, which
 * pulls domain, icon, and parent from this registry.
 *
 * @see src/types/stack.ts - Stack type definition with full documentation
 * @see src/data/projects.ts - How stacks are used in projects
 * @see src/utils/extract-stacks.ts - Stack extraction and parent merging
 */
export const STACK = {
  "Claude Code": {
    domain: "AI",
    icon: STACK_ICONS["Claude Code"],
  },
  ChatGPT: {
    domain: "AI",
    icon: STACK_ICONS.ChatGPT,
  },
  AntDesign: {
    domain: "Design",
    icon: STACK_ICONS.AntDesign,
  },
  Puppeteer: {
    domain: "QA",
    icon: STACK_ICONS.Puppeteer,
  },
  Effect: {
    domain: "Back-end",
    icon: STACK_ICONS.Effect,
  },
  JavaScript: {
    domain: "Front-end",
    icon: STACK_ICONS.JavaScript,
  },
  TypeScript: {
    domain: "Front-end",
    icon: STACK_ICONS.TypeScript,
  },
  React: {
    domain: "Front-end",
    icon: STACK_ICONS.React,
  },
  Tailwind: {
    domain: "Design",
    icon: STACK_ICONS.Tailwind,
  },
  XState: {
    domain: "Front-end",
    icon: STACK_ICONS.XState,
  },
  Tanstack: {
    domain: "Front-end",
    icon: STACK_ICONS.Tanstack,
  },
  "Tanstack DB": {
    parent: "Tanstack",
    domain: "Front-end",
    icon: STACK_ICONS["Tanstack DB"],
  },
  "Tanstack Start": {
    parent: "Tanstack",
    domain: "Front-end",
    icon: STACK_ICONS["Tanstack Start"],
  },
  "Tanstack Router": {
    parent: "Tanstack",
    domain: "Front-end",
    icon: STACK_ICONS["Tanstack Router"],
  },
  "Tanstack Query": {
    parent: "Tanstack",
    domain: "Front-end",
    icon: STACK_ICONS["Tanstack Query"],
  },
  Rust: {
    domain: "Back-end",
    icon: STACK_ICONS.Rust,
  },
  Vue: {
    domain: "Front-end",
    icon: STACK_ICONS.Vue,
  },
  Next: {
    domain: "Front-end",
    icon: STACK_ICONS.Next,
  },
  Vite: {
    domain: "Front-end",
    icon: STACK_ICONS.Vite,
  },
  Vitest: {
    domain: "QA",
    icon: STACK_ICONS.Vitest,
  },
  HTML: {
    domain: "Front-end",
    icon: STACK_ICONS.HTML,
  },
  CSS: {
    domain: "Design",
    icon: STACK_ICONS.CSS,
  },
  SCSS: {
    domain: "Design",
    icon: STACK_ICONS.SCSS,
  },
  GraphQL: {
    domain: "Front-end",
    icon: STACK_ICONS.GraphQL,
  },
  Lit: {
    domain: "Front-end",
    icon: STACK_ICONS.Lit,
  },
  Figma: {
    domain: "Design",
    icon: STACK_ICONS.Figma,
  },
  JSDoc: {
    domain: "Front-end",
    icon: STACK_ICONS.JSDoc,
  },
  Mocha: {
    domain: "QA",
    icon: STACK_ICONS.Mocha,
  },
  Redux: {
    domain: "Front-end",
    icon: STACK_ICONS.Redux,
  },
  "Redux-saga": {
    parent: "Redux",
    domain: "Front-end",
    icon: STACK_ICONS["Redux-saga"],
  },
  Flow: {
    domain: "Front-end",
    icon: STACK_ICONS.Flow,
  },
  "Material UI": {
    domain: "Design",
    icon: STACK_ICONS["Material UI"],
  },
  Knockout: {
    domain: "Front-end",
    icon: STACK_ICONS.Knockout,
  },
  SVG: {
    domain: "Design",
    icon: STACK_ICONS.SVG,
  },
  SQL: {
    domain: "Back-end",
    icon: STACK_ICONS.SQL,
  },
  "SQL Server": {
    domain: "Back-end",
    parent: "SQL",
    icon: STACK_ICONS["SQL Server"],
  },
  "Visual Basic.NET": {
    domain: "Back-end",
    icon: STACK_ICONS["Visual Basic.NET"],
  },
  PHP: {
    domain: "Back-end",
    icon: STACK_ICONS.PHP,
  },
  Webpack: {
    domain: "Front-end",
    icon: STACK_ICONS.Webpack,
  },
  Jest: {
    domain: "QA",
    icon: STACK_ICONS.Jest,
  },
  Preact: {
    domain: "Front-end",
    parent: "React",
    icon: STACK_ICONS.Preact,
  },
  Bash: {
    domain: "DevOps",
    icon: STACK_ICONS.Bash,
  },
  "GitHub Actions": {
    domain: "DevOps",
    icon: STACK_ICONS["GitHub Actions"],
  },
  Docker: {
    domain: "DevOps",
    icon: STACK_ICONS.Docker,
  },
} as const satisfies Record<
  StackName,
  {
    domain: Domain;
    icon: string;
    parent?: string;
  }
>;
