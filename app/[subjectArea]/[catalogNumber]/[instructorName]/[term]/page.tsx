import { generateMetadata as courseMetadata } from "../../page";
import { Redirect } from "@/app/components/Redirect";
import subjectIndexJson from "@/app/generated/subject-index.json";
import type { CourseRow } from "@/app/types";
import { getTermLongName } from "@/app/utils";
import { mapValues, uniqBy } from "lodash";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{
    subjectArea: string;
    catalogNumber: string;
    instructorName: string;
    term: string;
  }>;
};

const subjectIndex: Record<
  string,
  Record<string, CourseRow[]>
> = subjectIndexJson;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.entries(subjectIndex).flatMap(([subjectArea, catalog]) =>
    subjectArea === subjectArea.toUpperCase()
      ? Object.entries(catalog).flatMap(([catalogNumber, rows]) =>
          uniqBy(rows, (row) =>
            JSON.stringify([row.instructorName, row.enrollmentTerm]),
          ).map((row) => ({
            subjectArea,
            catalogNumber,
            instructorName: row.instructorName || "~",
            term: row.enrollmentTerm,
          })),
        )
      : [],
  );
}

async function getSelection(params: Props["params"]) {
  const selection = mapValues(await params, decodeURIComponent);
  const { subjectArea, catalogNumber, instructorName, term } = selection;
  const catalog = Object.hasOwn(subjectIndex, subjectArea)
    ? subjectIndex[subjectArea]
    : undefined;
  const rows =
    catalog && Object.hasOwn(catalog, catalogNumber)
      ? catalog[catalogNumber]
      : undefined;
  const instructor = instructorName === "~" ? "" : instructorName;
  if (
    !rows?.some(
      (row) => row.instructorName === instructor && row.enrollmentTerm === term,
    )
  )
    notFound();
  const coursePath = `/${encodeURIComponent(subjectArea)}/${encodeURIComponent(catalogNumber)}`;
  const selectionPath = `${coursePath}/${encodeURIComponent(instructorName)}/${encodeURIComponent(term)}`;
  return { ...selection, instructor, coursePath, selectionPath };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const selection = await getSelection(params);
  const base = await courseMetadata({ params });
  const instructor =
    selection.instructor.split(", ").reverse().join(" ") ||
    "Instructor not recorded";
  const title = `${selection.subjectArea} ${selection.catalogNumber}: ${instructor} · ${getTermLongName(selection.term)}`;
  const description = `Grade distribution for ${selection.subjectArea} ${selection.catalogNumber}, ${instructor}, ${getTermLongName(selection.term)}.`;
  const image = {
    url: `/og-image${selection.selectionPath}.png`,
    width: 1200,
    height: 630,
    alt: title,
  };
  return {
    ...base,
    title,
    description,
    openGraph: {
      ...base.openGraph,
      title,
      description,
      url: selection.selectionPath,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function SharedCourse({ params }: Props) {
  // This static page gives iOS Messages a selection-specific OG image without
  // running JavaScript. Browser visitors continue to the course's query URL.
  const { coursePath, instructor, term } = await getSelection(params);
  const query = new URLSearchParams({ instructor, term });
  const href = `${coursePath}?${query}`;
  return (
    <Redirect
      href={href}
      fallback={
        <p className="w-full p-8 text-center opacity-50">
          <a className="underline" href={href}>
            Open Course
          </a>
        </p>
      }
    >
      <p className="w-full p-8 text-center opacity-50">Loading...</p>
    </Redirect>
  );
}
