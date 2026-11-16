// Reuses data/course-details.csv, or fetches UCLA's raw course details to create it.
// Generates app/generated/course-details-index.json for course lookups.
// Runs as part of `yarn generate` alongside the grade data generator.
import { parse, stringify } from "csv/sync";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { BaseCourseRow } from "../app/types";

const API_BASE = "https://api.ucla.edu/sis/publicapis/course/";
const OUTPUT_PATH = path.resolve(__dirname, "course-details.csv");
const INDEX_PATH = path.resolve(
  __dirname,
  "../app/generated/course-details-index.json",
);

type CourseDetails = Record<string, string>;
type ExtractedCourseDetails = CourseDetails &
  BaseCourseRow & {
    cleanedDescription: string;
  };
type CourseDetailsIndex = Record<
  string,
  Record<string, ExtractedCourseDetails[]>
>;

function validateCourse(record: unknown): CourseDetails {
  if (
    typeof record !== "object" ||
    record === null ||
    Array.isArray(record) ||
    !("subj_area_cd" in record) ||
    !("course_title" in record) ||
    !("crs_desc" in record)
  ) {
    throw new Error("Unexpected course record");
  }
  const course: CourseDetails = {};
  for (const [key, value] of Object.entries(record)) {
    if (typeof value !== "string") {
      throw new Error(`Unexpected course field ${key}`);
    }
    course[key] = value;
  }
  return course;
}

async function fetchRecords(endpoint: string): Promise<unknown[]> {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(new URL(endpoint, API_BASE), {
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching ${endpoint}`);
      }
      const records: unknown = await response.json();
      if (!Array.isArray(records)) {
        throw new Error(`Expected an array from ${endpoint}`);
      }
      return records;
    } catch (error) {
      if (attempt === 3) throw error;
      console.warn(`Retrying ${endpoint} after attempt ${attempt}:`, error);
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
    }
  }
}

async function fetchCourses() {
  const subjects = await fetchRecords("getallcourses");
  const courses: CourseDetails[] = [];

  for (let index = 0; index < subjects.length; index++) {
    const subject = subjects[index];
    if (
      typeof subject !== "object" ||
      subject === null ||
      !("subj_area_cd" in subject) ||
      typeof subject.subj_area_cd !== "string"
    ) {
      throw new Error("Subject response is missing a subject code");
    }
    const { subj_area_cd } = subject;
    const query = new URLSearchParams({ subjectarea: subj_area_cd });
    const records = await fetchRecords(`getcoursedetail?${query}`);
    courses.push(...records.map(validateCourse));
    console.info(
      `[${index + 1}/${subjects.length}] ${subj_area_cd}: ${records.length} courses`,
    );
  }

  if (courses.length === 0) {
    throw new Error("No course details returned; CSV was not written");
  }

  // Include every raw field, even if it only appears in a later subject.
  const columns = Array.from(new Set(courses.flatMap(Object.keys)));
  const csv = stringify(courses, { header: true, columns });
  // Only replace the previous CSV after every subject has been fetched.
  await writeFile(OUTPUT_PATH, csv, "utf-8");
  console.info(`Wrote ${courses.length} courses to ${OUTPUT_PATH}`);
  return courses;
}

async function loadCourses(): Promise<CourseDetails[]> {
  let csv: string;
  try {
    csv = await readFile(OUTPUT_PATH, "utf-8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return fetchCourses();
    }
    throw error;
  }
  console.info(`Reusing ${OUTPUT_PATH}`);
  const records: unknown = parse(csv, { columns: true });
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error("Course details CSV contains no records");
  }
  return records.map(validateCourse);
}

// Match recognizable catalog logistics without removing subject matter that
// happens to mention hours, credit, or prerequisites.
const logisticsPatterns = [
  /^(?:Lecture|Discussion|Laboratory|Seminar|Tutorial|Studio|Activity|Fieldwork|Clinic|Practicum|Workshop|Recitation)\b(?:\s*[/,(;]|\s+(?:and|or)\b).*\b(?:hours?|minutes?|to be arranged)\b/i,
  /^(?:(?:Enforced|Recommended|Suggested|Required)\s+)*(?:requisites?|prerequisites?|corequisites?|co-requisites?|pre-requisites?)\s*(?::|for each offering\b)/i,
  /^(?:Recommended\s+)?preparation\s*:/i,
  /^(?:Units?|Credits?)\s*:/i,
  /^(?:Limited|Restricted|Open) to\b/i,
  /^Designed (?:for|as adjunct to)\b/i,
  /^(?:Consent|Permission) of\b.*\brequired\b/i,
  /^(?:Letter|P\/NP|S\/U|In Progress|No)\b.*\bgrading\b/i,
  /^(?:May|Can) (?:not )?be (?:repeated|taken independently|applied toward)\b/i,
  /^(?:Each course|Courses?) may be (?:taken|repeated)\b/i,
  /^Not open (?:for credit|to students)\b/i,
  /^Individual (?:honors )?contract\b.*\brequired\b/i,
  /^Honors content noted on transcript\b/i,
  /^Course \S+ is (?:a )?(?:requisite|prerequisite|corequisite)\b/i,
];

export function cleanCourseDescription(description: string): string {
  return description
    .trim()
    .replace(/^(?:\((?:Same as|Formerly numbered)\b[^)]*\)\s*)+/i, "")
    .split(/(?<=[.!?])\s+(?=[A-Z(])/)
    .filter(
      (sentence) =>
        !logisticsPatterns.some((pattern) => pattern.test(sentence)),
    )
    .join(" ")
    .trim();
}

function extractCourseDetails(course: CourseDetails): ExtractedCourseDetails {
  const separator = course.course_title.indexOf(". ");
  const subjectArea = course.subj_area_cd.trim();
  const catalogNumber = course.course_title.slice(0, separator).trim();
  if (separator < 1 || !subjectArea || !catalogNumber) {
    throw new Error(`Cannot index course: ${JSON.stringify(course)}`);
  }
  const camelCaseCourse: CourseDetails = {};
  for (const [key, value] of Object.entries(course)) {
    const camelCaseKey = key.replace(/_([a-z])/g, (_, letter: string) =>
      letter.toUpperCase(),
    );
    // Reserve courseTitle for the normalized title used by the other indexes.
    camelCaseCourse[key === "course_title" ? "rawCourseTitle" : camelCaseKey] =
      value;
  }
  return {
    ...camelCaseCourse,
    subjectArea,
    catalogNumber,
    courseTitle: course.course_title.slice(separator + 2).trim(),
    cleanedDescription: cleanCourseDescription(course.crs_desc),
  };
}

function createCourseIndex(
  courses: ExtractedCourseDetails[],
): CourseDetailsIndex {
  const index: CourseDetailsIndex = {};
  for (const course of courses) {
    const subject = (index[course.subjectArea] ??= {});
    (subject[course.catalogNumber] ??= []).push(course);
  }
  return index;
}

async function main() {
  // 1. Download raw records, or reuse the existing CSV.
  const rawCourses = await loadCourses();

  // 2. CamelCase source fields and add extracted/cleaned fields in memory.
  const courses = rawCourses.map(extractCourseDetails);

  // 3. Create and write the subject/course index.
  const index = createCourseIndex(courses);
  await mkdir(path.dirname(INDEX_PATH), { recursive: true });
  await writeFile(INDEX_PATH, JSON.stringify(index), "utf-8");
  console.info(`Indexed ${courses.length} courses in ${INDEX_PATH}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Failed to generate course details:", error);
    process.exitCode = 1;
  });
}
