import subjectIndex from "@/app/generated/subject-index.json";
import type { BaseCourseRow } from "@/app/types";

export type Response = Record<
  string,
  Record<string, Record<string, BaseCourseRow & { nRows: number }>>
>;

export const dynamic = "force-static";

export function GET() {
  const instructors: Response = {};
  // Reuse the course pages' source index instead of bundling the same rows
  // again from instructor-index.json.
  for (const courses of Object.values(subjectIndex)) {
    for (const rows of Object.values(courses)) {
      for (const {
        instructorName,
        subjectArea,
        catalogNumber,
        courseTitle,
      } of rows) {
        const subjects = (instructors[instructorName] ??= {});
        const catalog = (subjects[subjectArea] ??= {});
        if (catalog[catalogNumber]) {
          catalog[catalogNumber].nRows += 1;
        } else {
          catalog[catalogNumber] = {
            subjectArea,
            catalogNumber,
            courseTitle,
            nRows: 1,
          };
        }
      }
    }
  }
  return globalThis.Response.json(instructors);
}
