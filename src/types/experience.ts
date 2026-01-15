import type { Domain } from "./project";

export type DomainExperience = {
  domain: Domain;
  totalMonths: number;
  percentage: number;
};

export type ExperienceDuration = {
  totalMonths: number;
  years: number;
  months: number;
  duration: string;
};
