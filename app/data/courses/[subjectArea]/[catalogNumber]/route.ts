import subjectIndexJson from "@/app/generated/subject-index.json";
import type { CourseRow } from "@/app/types";

const subjectIndex: Record<
  string,
  Record<string, CourseRow[]>
> = subjectIndexJson;

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.entries(subjectIndex).flatMap(([subjectArea, catalog]) =>
    Object.keys(catalog).map((catalogNumber) => ({
      subjectArea,
      catalogNumber: `${catalogNumber}.json`,
    })),
  );
}

export async function GET(
  _: Request,
  {
    params,
  }: { params: Promise<{ subjectArea: string; catalogNumber: string }> },
) {
  const { subjectArea, catalogNumber: filename } = await params;
  const catalog = Object.hasOwn(subjectIndex, subjectArea)
    ? subjectIndex[subjectArea]
    : undefined;
  const catalogNumber = filename.slice(0, -5);
  if (
    !filename.endsWith(".json") ||
    !catalog ||
    !Object.hasOwn(catalog, catalogNumber)
  ) {
    return new Response("Course not found", { status: 404 });
  }
  return Response.json(catalog[catalogNumber]);
}
