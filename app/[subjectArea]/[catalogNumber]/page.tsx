import { Distribution } from "@/app/components/Distribution";
import subjectIndexJson from "@/app/generated/subject-index.json";
import courseDetailsIndexJson from "@/app/generated/course-details-index.json";
import type { CourseRow } from "@/app/types";
import { compareTerms, getTermLongName } from "@/app/utils";
import type { Metadata } from "next";
import { InstructorGradeTable } from "@/app/components/InstructorGradeTable";
import { notFound } from "next/navigation";
import { groupBy, last, maxBy, sumBy, uniq } from "lodash";

type Props = {
  params: Promise<{ subjectArea: string; catalogNumber: string }>;
};

const subjectIndex: Record<
  string,
  Record<string, CourseRow[]>
> = subjectIndexJson;

const courseDetailsIndex: Record<
  string,
  Record<
    string,
    {
      courseTitle: string;
      cleanedDescription: string;
      units: string;
      courseFormats: string[];
    }[]
  >
> = courseDetailsIndexJson;

export function generateStaticParams() {
  return Object.entries(subjectIndex).flatMap(([subjectArea, courses]) =>
    Object.keys(courses).map((catalogNumber) => ({
      subjectArea,
      catalogNumber,
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourseFromParams(await params);
  const rows = subjectIndex[course.subjectArea][course.catalogNumber];
  const gradeCount = sumBy(
    rows.filter(
      (row) =>
        Number.isFinite(Number(row.gradeCount)) && Number(row.gradeCount) >= 0,
    ),
    (row) => Number(row.gradeCount),
  );
  const defaultRows =
    maxBy(
      Object.values(groupBy(rows, (row) => row.instructorName)),
      (rows) => rows.length,
    ) ?? [];
  const instructor = defaultRows[0]?.instructorName || "~";
  const term =
    last(defaultRows.map((row) => row.enrollmentTerm).sort(compareTerms)) ?? "";
  const image = {
    url: `/og-image${course.path}/${encodeURIComponent(instructor)}/${encodeURIComponent(term)}.png`,
    width: 1200,
    height: 630,
    alt: `${course.subjectArea} ${course.catalogNumber} grade distribution`,
  };
  const title = `${course.subjectArea} ${course.catalogNumber} Grade Distribution & Professors`;
  const instructorCount = course.instructors.length;
  const coverage = `${course.terms[0]}${course.terms.length > 1 ? ` through ${course.terms[course.terms.length - 1]}` : ""}`;
  const description = `UCLA ${course.subjectArea} ${course.catalogNumber}: ${gradeCount.toLocaleString("en-US")} recorded grades${instructorCount > 0 ? ` across ${instructorCount.toLocaleString("en-US")} ${instructorCount === 1 ? "instructor" : "instructors"}` : ""}, ${coverage}. Compare grade distributions by professor and term.`;

  return {
    title,
    description,
    alternates: { canonical: course.path },
    openGraph: {
      title,
      description,
      url: course.path,
      images: [image],
      siteName: "UCLA Grade Distributions",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function Course({ params }: Props) {
  const {
    subjectArea,
    catalogNumber,
    courseTitle,
    description,
    units,
    courseFormats,
    instructors,
    terms,
    path,
  } = getCourseFromParams(await params);
  const subjectPath = `/?subjectArea=${encodeURIComponent(subjectArea)}`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Home", path: "/" },
      { name: subjectArea, path: subjectPath },
      { name: catalogNumber, path },
    ].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, "https://uclagrades.com").href,
    })),
  };
  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `UCLA ${subjectArea} ${catalogNumber} Grade Distributions`,
    description: `Recorded grade counts for UCLA ${subjectArea} ${catalogNumber}: ${courseTitle}, grouped by instructor, academic term, and grade. Available terms: ${terms.join(", ")}.`,
    url: new URL(path, "https://uclagrades.com").href,
    isAccessibleForFree: true,
    variableMeasured: ["Instructor", "Academic term", "Grade", "Grade count"],
    distribution: {
      "@type": "DataDownload",
      contentUrl: new URL(`/data/courses${path}.json`, "https://uclagrades.com")
        .href,
      encodingFormat: "application/json",
    },
  };

  return (
    <main className="flex flex-col w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumb, dataset]).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <div className="text-center">
        <div className="flex items-center justify-between p-6 sm:p-8 md:p-12">
          <div className="flex flex-1 justify-center items-center">
            <div className="w-full max-w-3xl text-center">
              <div className="flex justify-start gap-2 mb-4">
                <a className="text-uclaBlue hover:opacity-50" href={`/`}>
                  Home
                </a>
                <span aria-hidden="true">›</span>
                <a
                  className="text-uclaBlue hover:opacity-50"
                  href={subjectPath}
                >
                  {subjectArea}
                </a>
                <span aria-hidden="true">›</span>
                <a className="text-uclaBlue hover:opacity-50" href={path}>
                  {catalogNumber}
                </a>
              </div>
              <div className="flex items-start justify-start gap-3">
                <h1 className="min-w-0 text-left text-3xl sm:text-4xl font-bold leading-tight">
                  {subjectArea} {catalogNumber}: {courseTitle}
                </h1>
              </div>
              {description && (
                <p className="mt-5 text-left text-base leading-relaxed text-gray-700">
                  {description}
                </p>
              )}
              {(units || courseFormats.length > 0) && (
                <p className="mt-3 text-left text-sm text-gray-500">
                  {[
                    ...(units
                      ? [`${units} ${units === "1" ? "unit" : "units"}`]
                      : []),
                    ...courseFormats,
                  ].join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="w-full h-auto flex flex-1 justify-center p-4 sm:p-8 md:p-12 text-white bg-uclaBlue">
          <div className="flex flex-col w-full md:w-[65%] lg:w-[60%] xl:w-[50%] md:mx-auto items-center">
            <div className="relative w-full text-black bg-white shadow-xl p-4 sm:p-12 rounded-xl">
              <Distribution
                subjectArea={subjectArea}
                catalogNumber={catalogNumber}
              />
            </div>
            <div className="w-full min-w-0 text-left text-xs">
              {instructors.length > 0 && (
                <>
                  <div
                    className="mt-8 overflow-x-auto"
                    role="region"
                    aria-label="Instructor grade comparison"
                    tabIndex={0}
                  >
                    <InstructorGradeTable
                      instructors={instructors}
                      path={path}
                    />
                  </div>
                  <p className="mt-3">
                    A-range % and grade counts cover only each instructor’s
                    latest recorded term, shown in the &quot;Latest Data
                    From&quot; column, combining all sections for the course.
                    A-range % is the share of recorded letter grades (A+ through
                    F) that are A+, A, or A−. Parentheses show the A-range count
                    over the total letter-grade count. P/NP and incompletes are
                    excluded. Records may be incomplete.
                  </p>
                </>
              )}
              <dl className="mt-4">
                <div>
                  <dt className="font-bold">Available Academic Terms</dt>
                  <dd>{terms.join(" · ")}</dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col md:flex-row gap-2 mt-8">
              <a
                className="inline-flex items-center justify-center rounded border border-white/30 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uclaGold"
                href={subjectPath}
              >
                See All {subjectArea} Courses
              </a>
              <a
                className="inline-flex items-center justify-center rounded border border-white/30 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uclaGold"
                target="_blank"
                rel="noopener noreferrer"
                href="https://docs.google.com/forms/d/e/1FAIpQLSeVFPZF-0_28UPTVeZH-g2TA9gLlVvNxqDXNsIvIAMSoCJYCQ/viewform?usp=sf_link"
              >
                Report Missing Data
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function getCourseFromParams(params: Awaited<Props["params"]>) {
  const subjectArea = decodeURIComponent(params.subjectArea).toUpperCase();
  const catalogNumber = decodeURIComponent(params.catalogNumber).toUpperCase();

  if (!Object.hasOwn(subjectIndex, subjectArea)) {
    notFound();
  }

  const courses = subjectIndex[subjectArea];
  if (!Object.hasOwn(courses, catalogNumber)) {
    notFound();
  }

  const rows = courses[catalogNumber];
  if (!rows?.length) {
    notFound();
  }

  const details = courseDetailsIndex[subjectArea]?.[catalogNumber];
  // Prefer the current catalog entry over annotated future-effective versions.
  const detail = details?.find(
    (entry) => !/\(Effective\b/i.test(entry.courseTitle),
  );
  const courseTitle = detail?.courseTitle ?? rows[0].courseTitle;

  const terms = uniq(rows.map((row) => row.enrollmentTerm))
    .sort(compareTerms)
    .map(getTermLongName);
  const rowsByInstructor = groupBy(
    rows.filter((row) => row.instructorName),
    (row) => row.instructorName,
  );
  const instructors = Object.entries(rowsByInstructor)
    .map(([name, instructorRows]) => {
      const term =
        last(
          instructorRows.map((row) => row.enrollmentTerm).sort(compareTerms),
        ) ?? "";
      const letterGradeRows = instructorRows.filter(
        (row) =>
          row.enrollmentTerm === term &&
          /^(?:[ABCD][+-]?|F)$/.test(row.gradeOffered) &&
          Number.isFinite(Number(row.gradeCount)) &&
          Number(row.gradeCount) >= 0,
      );

      return {
        name,
        displayName: name.split(", ").reverse().join(" "),
        term,
        letterGradeCount: sumBy(letterGradeRows, (row) =>
          Number(row.gradeCount),
        ),
        aRangeCount: sumBy(
          letterGradeRows.filter((row) => /^A[+-]?$/.test(row.gradeOffered)),
          (row) => Number(row.gradeCount),
        ),
      };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  return {
    subjectArea,
    catalogNumber,
    courseTitle,
    description: detail?.cleanedDescription,
    units: detail?.units,
    courseFormats: detail?.courseFormats ?? [],
    terms,
    instructors,
    path: `/${encodeURIComponent(subjectArea)}/${encodeURIComponent(catalogNumber)}`,
  };
}
