"use client";

import "chart.js/auto";
import { groupBy, last, mapValues, maxBy, size, sum, sumBy } from "lodash";
import { compose, get } from "lodash/fp";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { UCLA_BLUE_RGB } from "../constants";
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
    () => groupBy(courseData, get("instructorName")),
    [courseData],
  );

  const rowCountByInstructorName = mapValues(courseDataByInstructorName, size);
  const [instructorWithMostSections] =
    maxBy(Object.entries(rowCountByInstructorName), get("1")) ?? [];

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
          get("enrollmentTerm"),
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
                get("gradeOffered"),
              );
              const gradeCountsForInstructorNameForTermByGradeOffered =
                mapValues(
                  courseDataForInstructorNameForTermByGradeOffered,
                  (courseDataForInstructorNameForTermForGradeOffered) => {
                    return sumBy(
                      courseDataForInstructorNameForTermForGradeOffered,
                      compose(Number, get("gradeCount")),
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
  const totalGradeCountForInstructorNameForTerm = sum(gradeCountArray);
  const maxGradeCount = Math.max(...gradeCountArray);

  const chartData = Object.keys(gradeCountsForInstructorNameForTerm ?? {})
    .map((gradeOffered) => ({
      x: gradeOffered,
      y: gradeCountsForInstructorNameForTerm[gradeOffered],
    }))
    .sort((a, b) => {
      return compareGrades(a.x, b.x);
    });

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
