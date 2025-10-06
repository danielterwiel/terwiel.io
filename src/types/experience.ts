import type { Domain } from "./project";

export type DateRange = {
  from: string;
  to: string;
};

export type MergedExperience = {
  totalMonths: number;
  years: number;
  months: number;
};

export type StackExperience = {
  totalMonths: number;
  years: number;
  months: number;
};

export type DomainExperienceSimple = {
  totalMonths: number;
  years: number;
  months: number;
};

export type DomainExperience = {
  domain: Domain;
  totalMonths: number;
  percentage: number;
};

export type TotalExperience = {
  totalMonths: number;
  years: number;
  months: number;
};

export type ExperienceDuration = {
  totalMonths: number;
  years: number;
  months: number;
  duration: string;
};

export interface DomainAngleRange {
  startAngle: number;
  endAngle: number;
  midAngle: number;
}
