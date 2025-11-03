export type Domain =
  | "DevOps"
  | "Back-end"
  | "Front-end"
  | "Design"
  | "QA"
  | "AI";

export type BadgeProps = {
  icon: string;
  name: string;
};

export type StackItem = {
  name: string;
  parent?: string;
  domain: Domain;
  icon: string;
  url?: string;
};

export type Project = {
  id: string;
  company: string;
  role: string;
  teamSize: number;
  industry: string;
  location: string;
  dateFrom: string;
  dateTo: string;
  description: string;
  stack: StackItem[];
  icon: string;
  url?: string;
};
