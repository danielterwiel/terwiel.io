import type { StackName } from "~/types";

import { STACK_ICONS } from "./icons";

export const STACK = {
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
  "Next.js": {
    domain: "Front-end",
    icon: STACK_ICONS["Next.js"],
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
  FlowType: {
    domain: "Front-end",
    icon: STACK_ICONS.FlowType,
  },
  "Material UI": {
    domain: "Design",
    icon: STACK_ICONS["Material UI"],
  },
  "Knockout.js": {
    domain: "Front-end",
    icon: STACK_ICONS["Knockout.js"],
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
  Puppeteer: {
    domain: "QA",
    icon: STACK_ICONS.Puppeteer,
  },
  Preact: {
    domain: "Front-end",
    parent: "React",
    icon: STACK_ICONS.Preact,
  },
  "Shell Script": {
    domain: "DevOps",
    icon: STACK_ICONS["Shell Script"],
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
    domain: "DevOps" | "Back-end" | "Front-end" | "Design" | "QA";
    icon: string;
    parent?: string;
  }
>;
