import { orderBy, sumBy } from "lodash";
import { UCLA_GRADE_POINTS } from "../constants";
import type { CourseRow } from "../types";
import { MINIMUM_GRADES, type RankingKind } from "./constants";

import subjectIndexJson from "../generated/subject-index.json";
import detailsIndexJson from "../generated/course-details-index.json";
import {
  compareTerms,
  getSubjectAreaLongName,
  getTermLongName,
} from "../utils";

const subjectIndex: Record<
  string,
  Record<string, CourseRow[]>
> = subjectIndexJson;
const detailsIndex: Record<
  string,
  Record<
    string,
    { courseTitle: string; subjectName: string; courseLevel?: string }[]
  >
> = detailsIndexJson;

export type CourseStats = {
  catalogNumber: string;
  courseTitle: string;
  recordedGrades: number;
  letterGrades: number;
  gradePoints: number;
  aGrades: number;
  failedGrades: number;
  division: "lower" | "upper";
  passed: number;
  notPassed: number;
  terms: string[];
};

export function summarizeCourses(courses: Record<string, CourseRow[]>) {
  return Object.entries(courses)
    .map(([catalogNumber, rows]) => ({
      catalogNumber,
      rows,
      // Prefixes such as M and C also occur on undergraduate catalog numbers.
      number: Number(catalogNumber.match(/^(?:[A-Z]*)(\d+)/)?.[1]),
    }))
    .filter(({ number }) => number < 200)
    .map(({ catalogNumber, rows, number }): CourseStats => {
      const validRows = rows
        .map((row) => ({ ...row, count: Number(row.gradeCount) }))
        .filter(
          ({ gradeCount, count, enrollmentTerm }) =>
            gradeCount.trim() !== "" &&
            Number.isFinite(count) &&
            count >= 0 &&
            /^\d{2}(?:[FWS]|\d)$/.test(enrollmentTerm),
        );
      const letterRows = validRows.filter(({ gradeOffered }) =>
        Object.hasOwn(UCLA_GRADE_POINTS, gradeOffered),
      );

      return {
        catalogNumber,
        courseTitle: rows[0]?.courseTitle ?? catalogNumber,
        recordedGrades: sumBy(validRows, (row) => row.count),
        letterGrades: sumBy(letterRows, (row) => row.count),
        gradePoints: sumBy(
          letterRows,
          ({ gradeOffered, count }) => UCLA_GRADE_POINTS[gradeOffered] * count,
        ),
        aGrades: sumBy(
          letterRows.filter(
            ({ gradeOffered }) => gradeOffered === "A+" || gradeOffered === "A",
          ),
          (row) => row.count,
        ),
        failedGrades: sumBy(
          letterRows.filter(({ gradeOffered }) => gradeOffered === "F"),
          (row) => row.count,
        ),
        division: number < 100 ? "lower" : "upper",
        passed: sumBy(
          validRows.filter(({ gradeOffered }) => gradeOffered === "P"),
          (row) => row.count,
        ),
        notPassed: sumBy(
          validRows.filter(({ gradeOffered }) => gradeOffered === "NP"),
          (row) => row.count,
        ),
        terms: Array.from(
          new Set(
            validRows
              .filter(({ count }) => count > 0)
              .map(({ enrollmentTerm }) => enrollmentTerm),
          ),
        ),
      };
    })
    .filter(({ recordedGrades }) => recordedGrades > 0);
}

export const averageGpa = (course: CourseStats) =>
  course.letterGrades ? course.gradePoints / course.letterGrades : 0;
export const aShare = (course: CourseStats) =>
  course.letterGrades ? course.aGrades / course.letterGrades : 0;
export const failureShare = (course: CourseStats) =>
  course.letterGrades ? course.failedGrades / course.letterGrades : 0;
export const passNoPassShare = (course: CourseStats) =>
  course.recordedGrades
    ? (course.passed + course.notPassed) / course.recordedGrades
    : 0;

function rank(
  courses: CourseStats[],
  score: (course: CourseStats) => number,
  ascending = false,
) {
  // Stable sorting preserves natural course-number order when scores and counts tie.
  const coursesByNumber = courses.toSorted((a, b) =>
    a.catalogNumber.localeCompare(b.catalogNumber, "en", { numeric: true }),
  );
  return orderBy(
    coursesByNumber,
    [score, (course) => course.recordedGrades],
    [ascending ? "asc" : "desc", "desc"],
  );
}

export function getRankings(courses: CourseStats[], kind: RankingKind) {
  if (kind.startsWith("easiest-") || kind === "hardest-classes-in") {
    const eligible = courses.filter(
      (course) =>
        course.letterGrades >= MINIMUM_GRADES &&
        (kind !== "easiest-upper-division-classes-in" ||
          course.division === "upper") &&
        (kind !== "easiest-lower-division-classes-in" ||
          course.division === "lower"),
    );
    return {
      primary: rank(eligible, averageGpa, kind === "hardest-classes-in"),
      secondary: rank(eligible, aShare, kind === "hardest-classes-in"),
    };
  }
  if (kind === "most-failed-classes-in") {
    return {
      primary: rank(
        courses.filter((course) => course.letterGrades >= MINIMUM_GRADES),
        failureShare,
      ),
      secondary: [],
    };
  }
  const eligible = courses.filter(
    (course) =>
      course.recordedGrades >= MINIMUM_GRADES &&
      (kind !== "most-passed-not-passed-classes-in" ||
        course.passed + course.notPassed > 0),
  );
  return {
    primary: rank(
      eligible,
      kind === "most-popular-classes-in" || kind === "least-popular-classes-in"
        ? (course) => course.recordedGrades
        : passNoPassShare,
      kind === "least-popular-classes-in",
    ),
    secondary: [],
  };
}

// Shared by page rendering, static params, metadata, and the sitemap.
export const departments = new Map(
  Object.entries(subjectIndex)
    .filter(([subject]) => subject === subject.toUpperCase())
    .map(([subjectArea, catalog]) => {
      const details = detailsIndex[subjectArea];
      const subjectName =
        getSubjectAreaLongName(subjectArea) ||
        Object.values(details ?? {})
          .flat()[0]
          ?.subjectName.replace(/\s*\([^)]*\)$/, "") ||
        subjectArea;
      const courses = summarizeCourses(catalog).flatMap((course) => {
        const detail = details?.[course.catalogNumber]?.find(
          (entry) => !/\(Effective\b/i.test(entry.courseTitle),
        );
        if (
          detail?.courseLevel &&
          detail.courseLevel !== "Lower Division Courses" &&
          detail.courseLevel !== "Upper Division Courses"
        ) {
          return [];
        }
        return [
          {
            ...course,
            courseTitle: detail?.courseTitle ?? course.courseTitle,
            division:
              detail?.courseLevel === "Lower Division Courses"
                ? ("lower" as const)
                : detail?.courseLevel === "Upper Division Courses"
                  ? ("upper" as const)
                  : course.division,
          },
        ];
      });
      const terms = Array.from(
        new Set(courses.flatMap((course) => course.terms)),
      ).sort(compareTerms);
      const coverage = terms.length
        ? `${getTermLongName(terms[0])}–${getTermLongName(terms[terms.length - 1])}`
        : "";
      return [
        subjectArea,
        { subjectArea, subjectName, courses, coverage },
      ] as const;
    }),
);

export const rankingSubjects = Array.from(
  departments.keys(),
  (subjectArea) => ({
    subjectArea,
  }),
);

export function rankingPath(kind: RankingKind, subjectArea: string) {
  return `/content/${kind}/${encodeURIComponent(subjectArea)}`;
}
