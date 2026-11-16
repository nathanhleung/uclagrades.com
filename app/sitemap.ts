import type { MetadataRoute } from "next";
import subjectIndex from "./generated/subject-index.json";
import { departments, getRankings, rankingPath } from "./content/utils";
import { rankingKinds } from "./content/constants";

const baseUrl = "https://uclagrades.com";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const courses = Object.entries(subjectIndex).flatMap(
    ([subjectArea, courses]) =>
      Object.keys(courses).map((catalogNumber) => ({
        url: `${baseUrl}/${encodeURIComponent(subjectArea)}/${encodeURIComponent(catalogNumber)}`,
      })),
  );

  return [
    ...["", "/about", "/shoutouts"].map((path) => ({
      url: `${baseUrl}${path}`,
    })),
    ...courses,
    ...rankingKinds.flatMap((kind) =>
      Array.from(departments.values())
        .filter(({ courses }) => getRankings(courses, kind).primary.length > 0)
        .map(({ subjectArea }) => ({
          url: `${baseUrl}${rankingPath(kind, subjectArea)}`,
        })),
    ),
  ];
}
