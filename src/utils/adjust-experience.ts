export interface Experience {
  years: number;
  months: number;
}

/**
 * Adjusts experience display based on tenure length.
 * For experiences over 5 years, rounds up years if months >= 6 and sets months to 0.
 * For experiences 5 years or less, returns unchanged.
 *
 * @param experience - Object containing years and months
 * @returns Adjusted experience object
 */
export function adjustExperience(experience: Experience): Experience {
  const { years, months } = experience;

  if (years > 5) {
    return {
      years: months >= 6 ? years + 1 : years,
      months: 0,
    };
  }

  return { years, months };
}
