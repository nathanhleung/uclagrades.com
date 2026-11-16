import subjectIndex from "@/app/generated/subject-index.json";
import type { BaseCourseRow } from "@/app/types";

export type Response = Record<
  string,
  Record<string, BaseCourseRow & { nRows: number }>
>;

export const dynamic = "force-static";

export function GET() {
  const courses: Response = {};
  for (const [subjectArea, catalog] of Object.entries(subjectIndex)) {
    courses[subjectArea] = {};
    for (const [catalogNumber, rows] of Object.entries(catalog)) {
      courses[subjectArea][catalogNumber] = {
        subjectArea,
        catalogNumber,
        courseTitle: rows[0].courseTitle,
        nRows: rows.length,
      };
    }
  }
  return globalThis.Response.json(courses);
}
