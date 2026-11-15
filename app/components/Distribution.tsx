"use client";

import "chart.js/auto";
import { groupBy, last, mapValues, maxBy, sumBy } from "lodash";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { UCLA_BLUE_RGB, UCLA_GRADE_POINTS } from "../constants";
import useCourseData from "../hooks/useCourseData";
import { compareGrades, compareTerms, getTermLongName } from "../utils";
import { Loading } from "./Loading";
import { Select } from "./Select";
import { useSearchParams } from "next/navigation";

type DistributionProps = {
  subjectArea: string;
  catalogNumber: string;
};

const Distribution = ({ subjectArea, catalogNumber }: DistributionProps) => {
  const { courseData } = useCourseData(subjectArea, catalogNumber);
  const [selectedInstructorName, setSelectedInstructorName] = useState("");

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.has("instructor")) {
      const instructorParam = searchParams.get("instructor") ?? "";
      setSelectedInstructorName(instructorParam);
    }
  }, [searchParams]);

  const [selectedTerm, setSelectedTerm] = useState<string>("");

  const courseDataByInstructorName = useMemo(
    () => groupBy(courseData, (row) => row.instructorName),
    [courseData],
  );

  const rowCountByInstructorName = mapValues(
    courseDataByInstructorName,
    (rows) => rows.length,
  );
  const [instructorWithMostSections] =
    maxBy(Object.entries(rowCountByInstructorName), ([, count]) => count) ?? [];

  // On initial load, set selected instructor to instructor with most sections
  useEffect(() => {
    if (selectedInstructorName === "" && instructorWithMostSections) {
      setSelectedInstructorName(instructorWithMostSections);
    }
  }, [instructorWithMostSections, selectedInstructorName]);

  const courseDataByInstructorNameByTerm = useMemo(
    () =>
      mapValues(courseDataByInstructorName, (courseDataForInstructorName) => {
        const courseDataForInstructorNameByTerm = groupBy(
          courseDataForInstructorName,
          (row) => row.enrollmentTerm,
        );
        return courseDataForInstructorNameByTerm;
      }),
    [courseDataByInstructorName],
  );

  const gradeCountsByInstructorNameByTerm = useMemo(
    () =>
      mapValues(
        courseDataByInstructorNameByTerm,
        (courseDataForInstructorNameByTerm) => {
          return mapValues(
            courseDataForInstructorNameByTerm,
            (courseDataForInstructorNameForTerm) => {
              const courseDataForInstructorNameForTermByGradeOffered = groupBy(
                courseDataForInstructorNameForTerm,
                (row) => row.gradeOffered,
              );
              const gradeCountsForInstructorNameForTermByGradeOffered =
                mapValues(
                  courseDataForInstructorNameForTermByGradeOffered,
                  (courseDataForInstructorNameForTermForGradeOffered) => {
                    return sumBy(
                      courseDataForInstructorNameForTermForGradeOffered,
                      (row) => Number(row.gradeCount),
                    );
                  },
                );
              return gradeCountsForInstructorNameForTermByGradeOffered;
            },
          );
        },
      ),
    [courseDataByInstructorNameByTerm],
  );

  const instructorNames = Object.keys(gradeCountsByInstructorNameByTerm);
  const instructorTerms = useMemo(
    () =>
      Object.keys(
        gradeCountsByInstructorNameByTerm[selectedInstructorName] ?? [],
      ).sort(compareTerms),
    [gradeCountsByInstructorNameByTerm, selectedInstructorName],
  );

  useEffect(() => {
    setSelectedTerm(last(instructorTerms) ?? "");
  }, [selectedInstructorName, instructorTerms]);

  const gradeCountsForInstructorNameForTerm =
    gradeCountsByInstructorNameByTerm?.[selectedInstructorName]?.[selectedTerm];
  const gradeCountArray = Object.values(
    gradeCountsForInstructorNameForTerm ?? {},
  );
  const validGradeCounts = Object.entries(
    gradeCountsForInstructorNameForTerm ?? {},
  ).filter(([, count]) => Number.isFinite(count) && count >= 0);
  const totalGradeCountForInstructorNameForTerm = sumBy(
    validGradeCounts,
    ([, count]) => count,
  );
  const letterGradeCounts = validGradeCounts.filter(([grade]) =>
    Object.hasOwn(UCLA_GRADE_POINTS, grade),
  );
  const letterGradeCount = sumBy(letterGradeCounts, ([, count]) => count);
  const aRangeCount = sumBy(
    letterGradeCounts.filter(([grade]) => /^A[+-]?$/.test(grade)),
    ([, count]) => count,
  );
  const gradePoints = sumBy(
    letterGradeCounts,
    ([grade, count]) => UCLA_GRADE_POINTS[grade] * count,
  );

  const averageGpa =
    letterGradeCount > 0 ? gradePoints / letterGradeCount : null;
  const maxGradeCount = Math.max(...gradeCountArray);

  const chartData = Object.keys(gradeCountsForInstructorNameForTerm ?? {})
    .map((gradeOffered) => ({
      x: gradeOffered,
      y: gradeCountsForInstructorNameForTerm[gradeOffered],
    }))
    .sort((a, b) => {
      return compareGrades(a.x, b.x);
    });

  const mostCommonGrades = chartData
    .filter(({ y }) => Number.isFinite(y) && y > 0 && y === maxGradeCount)
    .map(({ x }) => x);

  const chartConfig: React.ComponentProps<typeof Bar>["data"] = {
    datasets: [
      {
        data: chartData,
        backgroundColor: `rgba(${UCLA_BLUE_RGB}, 0.4)`,
      },
    ],
  };

  return (
    <div className="text-center">
      {courseData.length > 0 ? (
        <div className="flex flex-col justify-center">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-4 text-left">
            <div className="flex-1 md:flex-[2]">
              <label className="block mb-1 text-sm font-bold">
                Instructor Name
              </label>
              <Select
                value={selectedInstructorName}
                onChange={(newSelectedInstructorName) => {
                  if (
                    newSelectedInstructorName &&
                    newSelectedInstructorName !== selectedInstructorName
                  ) {
                    setSelectedInstructorName(newSelectedInstructorName);
                    setSelectedTerm("");

                    const url = new URL(window.location.href);
                    url.searchParams.set(
                      "instructor",
                      newSelectedInstructorName,
                    );
                    history.replaceState({}, "", url);
                  }
                }}
                options={instructorNames}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm font-bold">
                Academic Term
              </label>
              <Select
                value={selectedTerm}
                getLabel={getTermLongName}
                onChange={(newSelectedTerm) => {
                  if (newSelectedTerm) {
                    setSelectedTerm(newSelectedTerm);
                  }
                }}
                options={instructorTerms}
              />
            </div>
          </div>

          <Bar
            data={chartConfig}
            options={{
              animation: {
                duration: 0,
              },
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const gradeCount = context.parsed.y;
                      const percentageOfTotal =
                        (gradeCount / totalGradeCountForInstructorNameForTerm) *
                        100;
                      return `${gradeCount} (${percentageOfTotal.toFixed(1)}%)`;
                    },
                  },
                },
              },
              scales: {
                y: {
                  ticks: {
                    count: 7,
                    callback: (value) => {
                      const percentageTick =
                        Number(value) / totalGradeCountForInstructorNameForTerm;
                      return `${(percentageTick * 100).toFixed(1)}%`;
                    },
                  },
                  min: 0,
                  // If one letter grade makes up over ~93% of the total count of grades,
                  // keep 100% as the maximum tick; otherwise leave a top margin of 1/14th
                  // of the max single letter grade count for more spacing on top.
                  max: Math.min(
                    (15 / 14) * maxGradeCount,
                    totalGradeCountForInstructorNameForTerm,
                  ),
                },
              },
            }}
          />
          <div className="mt-4 text-left" aria-live="polite">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex flex-col text-left rounded-3xl bg-uclaBlue/5 px-3 py-3">
                <dt className="text-left text-xs font-bold">Average GPA</dt>
                <dd className="mt-auto flex flex-wrap items-baseline justify-start gap-x-1 pt-2 text-2xl font-bold tabular-nums">
                  <span className="block leading-8">
                    {averageGpa === null ? "—" : averageGpa.toFixed(2)}
                  </span>
                  <span className="whitespace-nowrap text-xs leading-4 font-normal text-gray-600">
                    / 4.00
                  </span>
                </dd>
              </div>
              <div className="flex flex-col text-left rounded-3xl bg-uclaBlue/5 px-3 py-3">
                <dt className="text-left text-xs font-bold">
                  Most Common Grade
                </dt>
                <dd className="mt-auto flex flex-wrap items-baseline justify-start gap-x-1 pt-2 text-2xl font-bold tabular-nums">
                  <span className="block leading-8">
                    {mostCommonGrades.length > 0
                      ? mostCommonGrades.join(", ")
                      : "—"}
                  </span>
                  <span className="whitespace-nowrap text-xs leading-4 font-normal text-gray-600">
                    {mostCommonGrades.length > 0 && (
                      <>
                        ({maxGradeCount.toLocaleString("en-US")}/
                        {totalGradeCountForInstructorNameForTerm.toLocaleString(
                          "en-US",
                        )}
                        {mostCommonGrades.length > 1 ? ", tied" : ""})
                      </>
                    )}
                  </span>
                </dd>
              </div>
              <div className="flex flex-col text-left rounded-3xl bg-uclaBlue/5 px-3 py-3">
                <dt className="text-left text-xs font-bold">A-range</dt>
                <dd className="mt-auto flex flex-wrap items-baseline justify-start gap-x-1 pt-2 text-2xl font-bold tabular-nums">
                  <span className="block leading-8">
                    {letterGradeCount > 0
                      ? `${((aRangeCount / letterGradeCount) * 100).toFixed(1)}%`
                      : "—"}
                  </span>
                  <span className="whitespace-nowrap text-xs leading-4 font-normal text-gray-600">
                    {letterGradeCount > 0 && (
                      <>
                        ({aRangeCount.toLocaleString("en-US")}/
                        {letterGradeCount.toLocaleString("en-US")})
                      </>
                    )}
                  </span>
                </dd>
              </div>
              <div className="flex flex-col text-left rounded-3xl bg-uclaBlue/5 px-3 py-3">
                <dt className="text-left text-xs font-bold">Recorded Grades</dt>
                <dd className="mt-auto flex flex-wrap items-baseline justify-start gap-x-1 pt-2 text-2xl font-bold tabular-nums">
                  <span className="block leading-8">
                    {totalGradeCountForInstructorNameForTerm.toLocaleString(
                      "en-US",
                    )}
                  </span>
                  <span className="whitespace-nowrap text-xs leading-4 font-normal text-gray-600">
                    (
                    {(
                      totalGradeCountForInstructorNameForTerm - letterGradeCount
                    ).toLocaleString("en-US")}{" "}
                    non-letter)
                  </span>
                </dd>
              </div>
            </dl>
          </div>
          <p className="mt-4 text-xs text-gray-600 text-left">
            &quot;Average GPA&quot; calculation uses{" "}
            {letterGradeCount.toLocaleString("en-US")} recorded letter grades
            (A+ through F), weighted by grade count on the{" "}
            <a
              href="https://internationalcenter.ucla.edu/resources/grading-system"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              UCLA scale
            </a>
            . A+ and A both count as 4.0. Other outcomes, including P/NP and
            incompletes, count toward recorded grades but are excluded from
            &quot;Average GPA&quot;.
            <br />
            <br />
            &quot;Most Common Grade&quot; shows its count over all recorded
            grades. &quot;A-range&quot; includes A+, A, and A−; parentheses show
            the A-range count over the total letter-grade count.
          </p>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};

const SuspendedDistribution = (props: DistributionProps) => {
  return (
    // Need to wrap in `Suspense` because `Distribution` uses `useSearchParams`
    <Suspense fallback={<Loading />}>
      <Distribution {...props} />
    </Suspense>
  );
};

export { SuspendedDistribution as Distribution };
