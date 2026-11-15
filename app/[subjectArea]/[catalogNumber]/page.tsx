import { Distribution } from "@/app/components/Distribution";
import { ShareCourseButton } from "@/app/components/ShareCourseButton";
import subjectIndexJson from "@/app/generated/subject-index.json";
import type { CourseRow } from "@/app/types";
import { compareTerms, getTermLongName } from "@/app/utils";
import type { Metadata } from "next";
import { InstructorGradeTable } from "@/app/components/InstructorGradeTable";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ subjectArea: string; catalogNumber: string }>;
};

const subjectIndex: Record<
  string,
  Record<string, CourseRow[]>
> = subjectIndexJson;

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
  const title = `${course.subjectArea} ${course.catalogNumber}: ${course.courseTitle}`;
  const description = `Explore UCLA grade distributions for ${course.subjectArea} ${course.catalogNumber}: ${course.courseTitle}. Compare grades by instructor and term. Available terms: ${course.terms[0]}${course.terms.length > 1 ? ` through ${course.terms[course.terms.length - 1]}` : ""}.`;

  return {
    title,
    description,
    alternates: { canonical: course.path },
    openGraph: {
      title,
      description,
      url: course.path,
      siteName: "UCLA Grade Distributions",
      type: "website",
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function Course({ params }: Props) {
  const { subjectArea, catalogNumber, courseTitle, instructors, terms, path } =
    getCourseFromParams(await params);
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

  return (
    <main className="flex flex-col w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c"),
        }}
      />
      <div className="text-center">
        <div className="flex items-center justify-between p-6 sm:p-8 md:p-12">
          <div className="flex flex-1 justify-center items-center">
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-6">
                <a className="text-uclaBlue hover:opacity-50" href={`/`}>
                  Home
                </a>
                <span>/</span>
                <a
                  className="text-uclaBlue hover:opacity-50"
                  href={subjectPath}
                >
                  {subjectArea}
                </a>
                <span>/</span>
                <a className="text-uclaBlue hover:opacity-50" href={path}>
                  {catalogNumber}
                </a>
              </div>
              <h1 className="flex flex-1 text-4xl mb-4 font-bold items-center justify-center gap-4">
                {subjectArea} {catalogNumber}
                <ShareCourseButton
                  subjectArea={subjectArea}
                  catalogNumber={catalogNumber}
                />
              </h1>
              <h2 className="flex-1 text-2xl">{courseTitle}</h2>
            </div>
          </div>
        </div>
        <div className="w-full h-auto flex flex-1 justify-center p-4 sm:p-8 md:p-12 text-white bg-uclaBlue">
          <div className="flex flex-col w-full md:w-[65%] lg:w-[60%] xl:w-[50%] md:mx-auto items-center">
            <div className="w-full text-black bg-white shadow-xl p-4 sm:p-12 rounded-xl">
              <Distribution
                subjectArea={subjectArea}
                catalogNumber={catalogNumber}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-2 mt-8">
              <a
                className="inline-flex items-center justify-center rounded border border-white/30 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uclaGold"
                href={subjectPath}
              >
                View more {subjectArea} courses
              </a>
              <a
                className="inline-flex items-center justify-center rounded border border-white/30 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uclaGold"
                target="_blank"
                rel="noopener noreferrer"
                href="https://docs.google.com/forms/d/e/1FAIpQLSeVFPZF-0_28UPTVeZH-g2TA9gLlVvNxqDXNsIvIAMSoCJYCQ/viewform?usp=sf_link"
              >
                Report missing data
              </a>
            </div>
            <div className="w-full min-w-0 text-left text-xs">
              {instructors.length > 0 && (
                <>
                  <div className="mt-8" role="region" tabIndex={0}>
                    <InstructorGradeTable
                      instructors={instructors}
                      path={path}
                    />
                  </div>
                  <p className="mt-3">
                    Counts and percentages cover each instructor’s latest
                    recorded term, combining all sections. A-range includes A+,
                    A, and A− as a share of recorded letter grades (A+ through
                    F). Other outcomes, including P/NP and incompletes, are
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

  const terms = Array.from(new Set(rows.map((row) => row.enrollmentTerm)))
    .sort(compareTerms)
    .map(getTermLongName);
  const latestByInstructor = new Map<
    string,
    { term: string; letterGradeCount: number; aRangeCount: number }
  >();
  for (const row of rows) {
    if (!row.instructorName) continue;

    let latest = latestByInstructor.get(row.instructorName);
    if (!latest || compareTerms(row.enrollmentTerm, latest.term) > 0) {
      latest = {
        term: row.enrollmentTerm,
        letterGradeCount: 0,
        aRangeCount: 0,
      };
      latestByInstructor.set(row.instructorName, latest);
    }
    if (row.enrollmentTerm !== latest.term) continue;

    const count = Number(row.gradeCount);
    if (
      !/^(?:[ABCD][+-]?|F)$/.test(row.gradeOffered) ||
      !Number.isFinite(count) ||
      count < 0
    ) {
      continue;
    }
    latest.letterGradeCount += count;
    if (/^A[+-]?$/.test(row.gradeOffered)) latest.aRangeCount += count;
  }
  const instructors = Array.from(latestByInstructor, ([name, stats]) => ({
    name,
    displayName: name.split(", ").reverse().join(" "),
    ...stats,
  })).sort((a, b) => a.displayName.localeCompare(b.displayName));

  return {
    subjectArea,
    catalogNumber,
    courseTitle: rows[0].courseTitle,
    terms,
    instructors,
    path: `/${encodeURIComponent(subjectArea)}/${encodeURIComponent(catalogNumber)}`,
  };
}
