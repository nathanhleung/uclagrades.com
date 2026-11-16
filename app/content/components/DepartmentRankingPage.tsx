import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MINIMUM_GRADES,
  INITIAL_RANKING_COUNT,
  rankingKinds,
  rankingLabels,
  type RankingKind,
} from "../constants";
import {
  aShare,
  averageGpa,
  failureShare,
  passNoPassShare,
  departments,
  getRankings,
  rankingPath,
} from "../utils";
import { CourseRankingTable } from "./CourseRankingTable";

export type PageProps = { params: Promise<{ subjectArea: string }> };

function getPage(rawSubjectArea: string, kind: RankingKind) {
  const subjectArea = decodeURIComponent(rawSubjectArea);
  const department = departments.get(subjectArea);
  if (!department) {
    notFound();
  }
  const rankings = getRankings(department.courses, kind);
  const { subjectName, coverage } = department;
  const descriptions: Record<RankingKind, string> = {
    "easiest-upper-division-classes-in": `Compare UCLA ${subjectName} upper-division classes by average GPA and A+/A %, using ${coverage} data. See sample sizes and grades by professor.`,
    "easiest-lower-division-classes-in": `Compare UCLA ${subjectName} lower-division classes by average GPA and A+/A %, using ${coverage} data. See sample sizes and grades by professor.`,
    "most-failed-classes-in": `Explore UCLA ${subjectName} undergraduate classes with the highest recorded F percentages in ${coverage}. Compare failure rates, sample sizes, and grades by professor.`,
    "easiest-classes-in": `Compare UCLA ${subjectName} undergraduate classes by recorded average GPA and A+/A %, using ${coverage} data. See sample sizes and explore grades by professor.`,
    "hardest-classes-in": `Explore UCLA ${subjectName} undergraduate classes with the lowest recorded average GPAs and A+/A percentages in ${coverage}. Compare grades by professor and quarter.`,
    "most-popular-classes-in": `Explore UCLA ${subjectName} undergraduate classes with the most recorded grades in ${coverage}. Compare courses and see grades by professor and quarter.`,
    "least-popular-classes-in": `Explore UCLA ${subjectName} undergraduate classes with the fewest recorded grades in ${coverage}, among courses with at least ${MINIMUM_GRADES} records. See course distributions.`,
    "most-passed-not-passed-classes-in": `Find UCLA ${subjectName} undergraduate classes with the largest share of recorded P/NP grades in ${coverage}. See counts and explore each course's distributions.`,
  };
  const title =
    kind === "most-passed-not-passed-classes-in"
      ? `UCLA ${subjectName} Classes Most Often Taken Passed/Not Passed`
      : `${rankingLabels[kind]} ${subjectName} Classes at UCLA`;
  const requirement =
    kind.startsWith("easiest-") ||
    kind === "hardest-classes-in" ||
    kind === "most-failed-classes-in"
      ? `at least ${MINIMUM_GRADES} recorded letter grades`
      : kind === "most-passed-not-passed-classes-in"
        ? `at least ${MINIMUM_GRADES} recorded grades and at least one P or NP outcome`
        : `at least ${MINIMUM_GRADES} recorded grades`;
  const description = rankings.primary.length
    ? descriptions[kind]
    : `Not enough data to rank UCLA ${subjectName} undergraduate classes. Courses need ${requirement}. Explore individual course grade distributions.`;
  return {
    ...department,
    ...rankings,
    title,
    description,
    requirement,
    path: rankingPath(kind, subjectArea),
  };
}

export async function rankingMetadata(
  { params }: PageProps,
  kind: RankingKind,
): Promise<Metadata> {
  const { subjectArea } = await params;
  const { title, description, path, primary } = getPage(subjectArea, kind);
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(primary.length === 0 && { robots: { index: false, follow: true } }),
    openGraph: { title, description, url: path, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export async function DepartmentRankingPage({
  params,
  kind,
}: PageProps & { kind: RankingKind }) {
  const page = getPage((await params).subjectArea, kind);
  const { subjectArea } = page;
  const hasData = page.primary.length > 0;
  const isFailed = kind === "most-failed-classes-in";
  const division =
    kind === "easiest-upper-division-classes-in"
      ? "upper-division"
      : kind === "easiest-lower-division-classes-in"
        ? "lower-division"
        : "undergraduate";
  const isHard = kind === "hardest-classes-in";
  const isGradeBased = kind.startsWith("easiest-") || isHard;
  const isPopular = kind === "most-popular-classes-in";
  const isPopularityBased = isPopular || kind === "least-popular-classes-in";
  const primaryHeading = isGradeBased
    ? isHard
      ? "Lowest average GPA"
      : "Highest average GPA"
    : isFailed
      ? "Highest failure rate (F %)"
      : isPopularityBased
        ? isPopular
          ? "Most recorded grades"
          : "Fewest recorded grades"
        : "Highest share of P/NP grades";
  const sections = [
    {
      heading: primaryHeading,
      courses: page.primary,
      metric: isGradeBased
        ? ("gpa" as const)
        : isFailed
          ? ("failure" as const)
          : isPopularityBased
            ? ("popular" as const)
            : ("pnp" as const),
    },
    ...(isGradeBased
      ? [
          {
            heading: isHard ? "Lowest A+/A %" : "Highest A+/A %",
            courses: page.secondary,
            metric: "aShare" as const,
          },
        ]
      : []),
  ].filter(({ courses }) => courses.length > 0);
  const absoluteUrl = (path: string) =>
    new URL(path, "https://uclagrades.com").href;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: page.title,
          item: absoluteUrl(page.path),
        },
      ],
    },
    ...sections.map(({ heading, courses }) => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${page.subjectName}: ${heading}`,
      numberOfItems: Math.min(courses.length, INITIAL_RANKING_COUNT),
      itemListElement: courses
        .slice(0, INITIAL_RANKING_COUNT)
        .map((course, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${subjectArea} ${course.catalogNumber}: ${course.courseTitle}`,
          url: absoluteUrl(
            `/${encodeURIComponent(subjectArea)}/${encodeURIComponent(course.catalogNumber)}`,
          ),
        })),
    })),
  ];

  return (
    <main className="w-full min-w-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-12">
        <p className="text-sm font-semibold text-uclaBlue">
          UCLA Grades Insights
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
          {page.title}
        </h1>
        <p className="mt-5 leading-relaxed text-gray-700">
          {!hasData
            ? `We don’t have enough recorded data to publish this ranking for UCLA ${page.subjectName} ${division} classes.`
            : isGradeBased
              ? `Based on ${page.coverage} grade records, these UCLA ${page.subjectName} ${division} classes have the ${isHard ? "lowest" : "highest"} average GPAs and A+/A percentages. Each list starts with up to ${INITIAL_RANKING_COUNT} courses with at least ${MINIMUM_GRADES} recorded letter grades.`
              : isFailed
                ? `Based on ${page.coverage} grade records, these UCLA ${page.subjectName} undergraduate classes have the highest percentage of recorded letter grades marked F. Courses need at least ${MINIMUM_GRADES} recorded letter grades to qualify.`
                : isPopularityBased
                  ? `Based on ${page.coverage} data, these UCLA ${page.subjectName} undergraduate classes have the ${isPopular ? "most" : "fewest"} recorded grades among courses with at least ${MINIMUM_GRADES} recorded grades. This ranking combines the available records across professors, sections, and terms.`
                  : `Based on ${page.coverage} data, these UCLA ${page.subjectName} undergraduate classes have the highest percentage of recorded grades marked Passed (P) or Not Passed (NP). Courses need at least ${MINIMUM_GRADES} recorded grades and at least one P or NP to qualify.`}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          {isGradeBased
            ? "Grades are one way to compare classes; they do not measure workload or guarantee a particular level of difficulty. Seminars, honors courses, and research classes may have enrollment restrictions."
            : isFailed
              ? "This is the recorded F rate, not a prediction of any student’s outcome. NP outcomes and D-range letter grades are not counted as F grades."
              : isPopularityBased
                ? "Recorded grade counts are a proxy for popularity, not a count of unique students or current enrollment. Fewer records may reflect incomplete coverage, infrequent offerings, or enrollment restrictions."
                : "This measures how frequently P/NP outcomes appear, not the likelihood of passing. Some courses may require P/NP grading; these records do not show whether a student chose it."}
        </p>
        {hasData ? (
          <div className="mt-6 rounded-xl bg-uclaBlue/5 p-5">
            <h2 className="font-bold">Compare professors before you enroll</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              Choose a course below to see its grade distributions by professor
              and quarter.
            </p>
          </div>
        ) : (
          <section className="mt-6 rounded-xl bg-uclaBlue/5 p-5">
            <h2 className="font-bold">Not enough data</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              {`Courses need ${page.requirement} to qualify. No ${division} courses in this subject meet those criteria in the available records.`}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              You can still explore individual course distributions using the
              link below.
            </p>
          </section>
        )}
        {sections.map(({ heading, courses, metric }) => (
          <section key={metric} className="mt-10">
            <h2 className="text-2xl font-bold">{heading}</h2>
            <CourseRankingTable
              key={`${subjectArea}-${metric}`}
              subjectArea={subjectArea}
              rows={courses.map((course) => ({
                catalogNumber: course.catalogNumber,
                courseTitle: course.courseTitle,
                value:
                  metric === "gpa"
                    ? averageGpa(course).toFixed(2)
                    : metric === "aShare"
                      ? `${(aShare(course) * 100).toFixed(1)}%`
                      : metric === "failure"
                        ? `${(failureShare(course) * 100).toFixed(1)}%`
                        : metric === "popular"
                          ? course.recordedGrades.toLocaleString("en-US")
                          : `${(passNoPassShare(course) * 100).toFixed(1)}%`,
                sample:
                  metric === "pnp"
                    ? `${(course.passed + course.notPassed).toLocaleString("en-US")} / ${course.recordedGrades.toLocaleString("en-US")}`
                    : metric === "failure"
                      ? `${course.failedGrades.toLocaleString("en-US")} / ${course.letterGrades.toLocaleString("en-US")}`
                      : course.letterGrades.toLocaleString("en-US"),
              }))}
              metric={metric}
            />
          </section>
        ))}
        <section className="mt-10 border-t border-gray-200 pt-6 text-sm leading-relaxed text-gray-600">
          <h2 className="text-lg font-bold text-gray-900">
            How these rankings work
          </h2>
          <p className="mt-3">
            We combine recorded grade counts across all available terms and
            instructors for each undergraduate course (catalog numbers below
            200, including prefixed courses).{" "}
            {page.coverage && (
              <>The coverage for this subject is {page.coverage}. </>
            )}
            Records may be incomplete, and historical results may differ from a
            course’s current format.
          </p>
          {division !== "undergraduate" && (
            <p className="mt-3">
              This ranking includes only {division} courses:{" "}
              {division === "upper-division" ? "100–199" : "1–99"}, including
              prefixed catalog numbers.
            </p>
          )}
          {isGradeBased ? (
            <p className="mt-3">
              Average GPA is weighted by the number of each letter grade, using
              the UCLA 4.0 scale. A+ and A both count as 4.0. A+/A % is (A+ + A)
              divided by all letter grades (A+ through F); A− remains in the
              denominator. P/NP and other non-letter outcomes are excluded from
              both calculations.
            </p>
          ) : isFailed ? (
            <p className="mt-3">
              F % is the number of recorded F grades divided by all recorded
              letter grades (A+ through F). P/NP and other non-letter outcomes
              are excluded. The counts show F grades over total letter grades.
              Courses need at least {MINIMUM_GRADES} recorded letter grades to
              qualify.
            </p>
          ) : isPopularityBased ? (
            <p className="mt-3">
              We sum valid recorded grade counts, including letter grades and
              non-letter outcomes, rather than adding enrollment totals repeated
              on grade rows. Courses with fewer than {MINIMUM_GRADES} recorded
              grades are excluded.
            </p>
          ) : (
            <p className="mt-3">
              P/NP % is (P + NP) divided by all recorded grades, including
              letter grades and other non-letter outcomes.
              Satisfactory/Unsatisfactory (S/U) is not counted as P/NP. The
              counts beside each percentage show the size of the sample.
            </p>
          )}
          <p className="mt-3">
            Rankings use unrounded values. Ties are ordered by total recorded
            grades, then course number.{" "}
            <Link
              href="/about"
              className="text-uclaBlue hover:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uclaBlue"
            >
              Learn about the data.
            </Link>
          </p>
        </section>
        <div className="mt-8">
          <Link
            href={`/?subjectArea=${encodeURIComponent(subjectArea)}`}
            className="inline-flex items-center justify-center gap-2 rounded bg-uclaBlue px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-uclaDarkerBlue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uclaDarkerBlue"
          >
            Explore all {page.subjectName} courses →
          </Link>
          <nav
            className="mt-4 flex flex-wrap gap-2"
            aria-label="Other department rankings"
          >
            {rankingKinds
              .filter((otherKind) => otherKind !== kind)
              .map((otherKind) => (
                <Link
                  key={otherKind}
                  href={rankingPath(otherKind, subjectArea)}
                  prefetch={false}
                  className="inline-flex items-center justify-center rounded border border-uclaBlue/30 px-2 py-1 text-center text-xs font-semibold text-uclaBlue transition-colors hover:bg-uclaBlue/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uclaBlue"
                >
                  {rankingLabels[otherKind]} {subjectArea} Classes
                </Link>
              ))}
          </nav>
        </div>
      </article>
    </main>
  );
}
