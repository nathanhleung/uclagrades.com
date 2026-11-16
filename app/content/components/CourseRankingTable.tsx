"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { INITIAL_RANKING_COUNT, type RankingMetric } from "../constants";

export function CourseRankingTable({
  subjectArea,
  rows,
  metric,
}: {
  subjectArea: string;
  rows: {
    catalogNumber: string;
    courseTitle: string;
    value: string;
    sample: string;
  }[];
  metric: RankingMetric;
}) {
  const [expanded, setExpanded] = useState(false);
  const tableId = useId();
  const visibleRows = expanded ? rows : rows.slice(0, INITIAL_RANKING_COUNT);
  const label = {
    gpa: "Average GPA",
    aShare: "A+/A %",
    popular: "Recorded grades",
    pnp: "P/NP %",
    failure: "F %",
  }[metric];
  return (
    <>
      <div
        className="mt-5 overflow-x-auto"
        role="region"
        aria-label={`Courses by ${label}`}
        tabIndex={0}
      >
        <table id={tableId} className="w-full min-w-[20rem] text-left text-sm">
          <thead className="border-b border-gray-200 text-gray-600">
            <tr>
              <th scope="col" className="py-2 pr-4 font-medium">
                Rank
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                Course
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">
                {label}
              </th>
              {metric !== "popular" && (
                <th scope="col" className="py-2 pr-4 text-right font-medium">
                  {metric === "pnp"
                    ? "P + NP / all grades"
                    : metric === "failure"
                      ? "F / letter grades"
                      : "Letter grades"}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((course, index) => (
              <tr
                key={course.catalogNumber}
                className="border-b border-gray-200"
              >
                <td className="py-3 pr-4 align-top text-gray-500">
                  {index + 1}
                </td>
                <th scope="row" className="py-3 pr-4 font-normal">
                  <Link
                    href={`/${encodeURIComponent(subjectArea)}/${encodeURIComponent(course.catalogNumber)}`}
                    prefetch={false}
                    className="block text-uclaBlue hover:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uclaBlue"
                  >
                    <span className="block font-semibold">
                      {subjectArea} {course.catalogNumber}
                    </span>
                    <span className="mt-1 block text-gray-700">
                      {course.courseTitle}
                    </span>
                    <span className="mt-2 block text-xs font-semibold">
                      View grades by professor →
                    </span>
                  </Link>
                </th>
                <td className="py-3 pr-4 text-right align-top tabular-nums font-semibold">
                  {course.value}
                </td>
                {metric !== "popular" && (
                  <td className="py-3 pr-4 text-right align-top tabular-nums">
                    {course.sample}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > INITIAL_RANKING_COUNT && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={tableId}
          onClick={() => setExpanded((current) => !current)}
          className="mt-4 inline-flex items-center justify-center rounded bg-uclaBlue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-uclaDarkerBlue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uclaDarkerBlue"
        >
          {expanded
            ? "Show fewer"
            : `Show all ${rows.length.toLocaleString("en-US")} courses`}
        </button>
      )}
    </>
  );
}
