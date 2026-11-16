import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { compareGrades, compareTerms, getTermLongName } from "@/app/utils";
import { UCLA_GRADE_POINTS } from "@/app/constants";
import subjectIndexJson from "@/app/generated/subject-index.json";
import detailsIndexJson from "@/app/generated/course-details-index.json";
import type { CourseRow } from "@/app/types";

const subjectIndex: Record<
  string,
  Record<string, CourseRow[]>
> = subjectIndexJson;
const detailsIndex: Record<
  string,
  Record<string, { courseTitle: string }[]>
> = detailsIndexJson;

// ImageResponse's bundled font has only a regular weight. Supply real bold
// outlines as well so the hierarchy survives a small messaging-app preview.
const fonts = ([400, 700] as const).map((weight) => ({
  name: "Geist",
  data: readFileSync(
    path.join(
      process.cwd(),
      "app/fonts",
      weight === 700 ? "Geist-Bold.ttf" : "Geist-Regular.ttf",
    ),
  ),
  weight,
  style: "normal" as const,
}));

/** Image-only statistics; keep the interactive chart independent. */
function getChartStats(grades: { x: string; y: number }[]) {
  const validGrades = grades.filter(({ y }) => Number.isFinite(y) && y >= 0);
  const total = validGrades.reduce((sum, { y }) => sum + y, 0);
  const letterGrades = validGrades.filter(({ x }) =>
    Object.hasOwn(UCLA_GRADE_POINTS, x),
  );
  const letterGradeCount = letterGrades.reduce((sum, { y }) => sum + y, 0);
  const aRangeCount = letterGrades.reduce(
    (sum, { x, y }) => sum + (/^A[+-]?$/.test(x) ? y : 0),
    0,
  );
  const gradePoints = letterGrades.reduce(
    (sum, { x, y }) => sum + UCLA_GRADE_POINTS[x] * y,
    0,
  );
  return {
    total,
    letterGradeCount,
    aRangeCount,
    averageGpa: letterGradeCount > 0 ? gradePoints / letterGradeCount : null,
  };
}

/** The default social preview uses the most represented instructor's latest term. */
function getDefaultChart(rows: CourseRow[]) {
  const instructors = new Map<string, number>();
  for (const row of rows)
    instructors.set(
      row.instructorName,
      (instructors.get(row.instructorName) ?? 0) + 1,
    );
  const instructor = Array.from(instructors.keys()).reduce(
    (best, name) =>
      instructors.get(name)! > (instructors.get(best) ?? 0) ? name : best,
    instructors.keys().next().value ?? "",
  );
  const instructorRows = rows.filter(
    (row) => row.instructorName === instructor,
  );
  const term =
    instructorRows
      .map((row) => row.enrollmentTerm)
      .sort(compareTerms)
      .at(-1) ?? "";
  const counts = new Map<string, number>();
  for (const row of instructorRows) {
    const count = Number(row.gradeCount);
    if (row.enrollmentTerm === term && Number.isFinite(count) && count >= 0) {
      counts.set(row.gradeOffered, (counts.get(row.gradeOffered) ?? 0) + count);
    }
  }
  const grades = Array.from(counts, ([x, y]) => ({ x, y })).sort((a, b) =>
    compareGrades(a.x, b.x),
  );
  return { instructor, term, grades };
}

/** Coarser letter-grade buckets keep social previews legible at thumbnail size. */
function getLetterGradeGroups(grades: { x: string; y: number }[]) {
  return ["A", "B", "C", "D", "F"].map((letter) => ({
    x: letter,
    y: grades.reduce(
      (sum, { x, y }) =>
        /^(?:[ABCD][+-]?|F)$/.test(x) &&
        x[0] === letter &&
        Number.isFinite(y) &&
        y >= 0
          ? sum + y
          : sum,
      0,
    ),
  }));
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.entries(subjectIndex).flatMap(([subjectArea, catalog]) =>
    Object.keys(catalog).map((catalogNumber) => ({
      subjectArea,
      catalogNumberDotPng: `${catalogNumber}.png`,
    })),
  );
}

export async function GET(
  _: Request,
  {
    params,
  }: { params: Promise<{ subjectArea: string; catalogNumberDotPng: string }> },
) {
  const { subjectArea, catalogNumberDotPng } = await params;
  const catalog = Object.hasOwn(subjectIndex, subjectArea)
    ? subjectIndex[subjectArea]
    : undefined;
  const catalogNumber = catalogNumberDotPng.slice(0, -4);
  if (
    !catalogNumberDotPng.endsWith(".png") ||
    !catalog ||
    !Object.hasOwn(catalog, catalogNumber)
  ) {
    return new Response("Course not found", { status: 404 });
  }
  const rows = catalog[catalogNumber];
  const title =
    detailsIndex[subjectArea]?.[catalogNumber]?.find(
      (entry) => !/\(Effective\b/i.test(entry.courseTitle),
    )?.courseTitle ?? rows[0].courseTitle;
  const view = getDefaultChart(rows);
  const grades = getLetterGradeGroups(view.grades);
  const maximum = Math.max(1, ...grades.map(({ y }) => y));
  const displayInstructor =
    view.instructor.split(", ").reverse().join(" ") || "All instructors";
  const stats = getChartStats(view.grades);
  const code = `${subjectArea} ${catalogNumber}`;
  const mode = grades
    .filter(({ y }) => y > 0 && y === maximum)
    .map(({ x }) => x);
  const statCards = [
    {
      label: "Average (as GPA)",
      value: stats.averageGpa === null ? "—" : stats.averageGpa.toFixed(2),
    },
    {
      label: "Most Common",
      value:
        mode.length > 2
          ? `${mode[0]} +${mode.length - 1} tied`
          : mode.join(" / ") || "—",
    },
    {
      label: "A+/A/A- %",
      value: stats.letterGradeCount
        ? `${((stats.aRangeCount / stats.letterGradeCount) * 100).toFixed(1)}%`
        : "—",
    },
    { label: "Recorded Grades", value: stats.total.toLocaleString("en-US") },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "white",
          color: "#111827",
          borderTop: "10px solid #ffd100",
          padding: "30px 48px 40px",
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            height: 154,
            justifyContent: "space-between",
            gap: 32,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", width: 696 }}>
            <div
              style={{
                display: "flex",
                height: 72,
                alignItems: "center",
                fontSize: code.length > 16 ? 52 : 64,
                fontWeight: 700,
                color: "#005587",
                letterSpacing: -2,
              }}
            >
              {code}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                lineHeight: 1.25,
                height: 74,
                marginTop: 4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineClamp: 2,
              }}
            >
              {title}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              width: 376,
              textAlign: "right",
              paddingTop: 13,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 700,
                color: "#2774ae",
                letterSpacing: -0.7,
              }}
            >
              uclagrades.com
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
                fontSize: 24,
                lineHeight: 1.2,
                maxHeight: 58,
                marginTop: 10,
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineClamp: 2,
                color: "#4b5563",
              }}
            >
              {displayInstructor.toUpperCase()}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 400,
                color: "#4b5563",
                marginTop: 4,
              }}
            >
              {getTermLongName(view.term).toUpperCase()}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            height: 236,
            marginTop: 16,
            position: "relative",
            padding: "16px 24px",
            border: "2px solid #e5e7eb",
            borderRadius: 16,
          }}
        >
          {grades.map(({ x, y }) => (
            <div
              key={x}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "20%",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: 148,
                  justifyContent: "center",
                  alignItems: "flex-end",
                  borderBottom: "2px solid #dbe5ef",
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: (y / maximum) * 140,
                    background: y === maximum ? "#2774ae" : "#a9c9e0",
                    borderRadius: "8px 8px 0 0",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  height: 40,
                  marginTop: 10,
                  fontSize: 30,
                  fontWeight: 700,
                  color: "#005587",
                  alignItems: "center",
                }}
              >
                {x}
              </div>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              position: "absolute",
              left: 0,
              top: 18,
              width: "100%",
              height: 148,
              alignItems: "center",
              justifyContent: "center",
              fontSize: 100,
              fontWeight: 700,
              letterSpacing: -4,
              color: "#9ca3af",
              opacity: 0.15,
            }}
          >
            uclagrades.com
          </div>
          {stats.letterGradeCount === 0 && (
            <div
              style={{
                display: "flex",
                position: "absolute",
                left: 0,
                top: 50,
                width: "100%",
                justifyContent: "center",
                fontSize: 28,
                color: "#6b7280",
              }}
            >
              No letter grades recorded
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 22 }}>
          {statCards.map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minWidth: 0,
                height: 118,
                padding: "16px 22px",
                borderRadius: 24,
                background: "#f2f7fb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  height: 28,
                  fontSize: 23,
                  fontWeight: 700,
                  color: "#374151",
                  alignItems: "center",
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  display: "flex",
                  height: 54,
                  alignItems: "center",
                  fontSize: stat.value.length > 8 ? 36 : 44,
                  fontWeight: 700,
                  color: "#005587",
                  letterSpacing: -1,
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts },
  );
}
