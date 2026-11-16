export const MINIMUM_GRADES = 50;
export const INITIAL_RANKING_COUNT = 10;
export const rankingLabels = {
  "easiest-classes-in": "Easiest",
  "easiest-upper-division-classes-in": "Easiest Upper-Division",
  "easiest-lower-division-classes-in": "Easiest Lower-Division",
  "hardest-classes-in": "Hardest",
  "most-failed-classes-in": "Most Failed",
  "most-popular-classes-in": "Most Popular",
  "least-popular-classes-in": "Least Popular",
  "most-passed-not-passed-classes-in": "Most P/NP",
} as const;

export type RankingKind = keyof typeof rankingLabels;
export const rankingKinds = Object.keys(rankingLabels) as RankingKind[];
export type RankingMetric = "gpa" | "aShare" | "popular" | "pnp" | "failure";
