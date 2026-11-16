"use client";

import Link from "next/link";
import { orderBy, uniq } from "lodash";
import { useState } from "react";
import { compareTerms, getTermLongName } from "../utils";

type InstructorSummary = {
  name: string;
  displayName: string;
  term: string;
  letterGradeCount: number;
  aGradeCount: number;
};

export function InstructorGradeTable({
  instructors,
  path,
}: {
  instructors: InstructorSummary[];
  path: string;
}) {
  type SortColumn = "instructor" | "term" | "count" | "aGrade";
  const columns: { key: SortColumn; label: string; numeric: boolean }[] = [
    { key: "instructor", label: "Instructor", numeric: false },
    { key: "term", label: "Latest Data From", numeric: false },
    { key: "count", label: "Latest Grades Count", numeric: true },
    { key: "aGrade", label: "A+/A %", numeric: true },
  ];
  const [{ column: sortColumn, descending }, setSorting] = useState<{
    column: SortColumn;
    descending: boolean;
  }>({ column: "aGrade", descending: true });
  const nextDescending = (column: SortColumn) =>
    column === sortColumn ? !descending : column !== "instructor";
  // Stable sorting keeps equal values in locale-aware alphabetical order.
  const instructorsByName = [...instructors].sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );
  const terms = uniq(instructors.map((instructor) => instructor.term)).sort(
    compareTerms,
  );
  const sortIteratees: Record<
    SortColumn,
    (instructor: InstructorSummary) => number
  > = {
    instructor: (instructor) => instructorsByName.indexOf(instructor),
    term: ({ term }) => terms.indexOf(term),
    count: ({ letterGradeCount }) => letterGradeCount,
    aGrade: ({ aGradeCount, letterGradeCount }) =>
      letterGradeCount ? aGradeCount / letterGradeCount : 0,
  };
  const sortedInstructors = orderBy(
    instructorsByName,
    [
      // Missing percentages stay last in either direction.
      ({ letterGradeCount }) => sortColumn === "aGrade" && !letterGradeCount,
      sortIteratees[sortColumn],
    ],
    ["asc", descending ? "desc" : "asc"],
  );

  return (
    <table className="w-full min-w-[28rem] text-left">
      <thead className="border-b border-white/30">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              aria-sort={
                sortColumn === column.key
                  ? descending
                    ? "descending"
                    : "ascending"
                  : undefined
              }
              className={`py-2 font-medium ${column.key !== "aGrade" ? "pr-4" : ""} ${column.numeric ? "text-right" : ""}`}
            >
              <button
                type="button"
                onClick={() =>
                  setSorting({
                    column: column.key,
                    descending: nextDescending(column.key),
                  })
                }
                className="inline-flex cursor-pointer items-center gap-1 hover:underline underline-offset-4"
                aria-label={`Sort by ${column.label}, ${nextDescending(column.key) ? "descending" : "ascending"}`}
              >
                {column.label}
                <svg
                  aria-hidden="true"
                  className="h-3 w-3 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d={
                      sortColumn === column.key
                        ? descending
                          ? "m6 9 6 6 6-6"
                          : "m6 15 6-6 6 6"
                        : "m7 9 5-5 5 5 M7 15l5 5 5-5"
                    }
                  />
                </svg>
              </button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedInstructors.map((instructor) => (
          <tr key={instructor.name} className="border-b border-white/20">
            <th scope="row" className="py-3 pr-4 font-normal">
              <Link
                className="underline underline-offset-4 hover:opacity-80"
                href={`${path}?instructor=${encodeURIComponent(instructor.name)}`}
                scroll={false}
                prefetch={false}
              >
                {instructor.displayName}
              </Link>
            </th>
            <td className="whitespace-nowrap py-3 pr-4">
              {getTermLongName(instructor.term)}
            </td>
            <td className="py-3 pr-4 text-right tabular-nums">
              {instructor.letterGradeCount}
            </td>
            <td className="py-3 text-right tabular-nums">
              {instructor.letterGradeCount > 0 ? (
                <>
                  {`${((instructor.aGradeCount / instructor.letterGradeCount) * 100).toFixed(1)}%`}{" "}
                  <span className="inline-block text-[0.85em] text-white/75">
                    ({instructor.aGradeCount.toLocaleString("en-US")})
                  </span>
                </>
              ) : (
                "—"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
