import { Response } from "@/app/api/courses/route";
import { CourseQueryResults } from "./CourseQueryResults";

function getSubjectAreaCourses(courses: Response, subjectArea: string) {
  return Object.values(courses[subjectArea] ?? {});
}

export function matchCourse(query: string) {
  const normalizedQuery = query.toLowerCase().trim();

  return (row: ReturnType<typeof getSubjectAreaCourses>[number]) => {
    const { catalogNumber } = row;

    // Sort by course number, ascending (strip all letters)
    let score = Number(catalogNumber.replace(/\D/g, ""));

    // This makes sure sequences courses are ranked correctly
    const lastCharCode = catalogNumber
      .toLowerCase()
      .charCodeAt(catalogNumber.length - 1);
    // a-z lowercase in ASCII
    if (lastCharCode >= 97 && lastCharCode <= 122) {
      // This ensures the ordering 101 < 101A < 101Z < 102
      // TODO(nathanhleung): handle honors math courses
      score += (lastCharCode - 96) / 27;
    }

    return {
      matches: row.catalogNumber.toLowerCase().indexOf(normalizedQuery) !== -1,
      // Sort by course number, ascending
      score: -1 * score,
    };
  };
}

type CatalogNumberQueryResultsProps = {
  courses: Response;
  /**
   * The subject area within which we are searching for courses
   */
  subjectArea: string;
  /**
   * The catalog number query
   */
  query: string;
};

const CatalogNumberQueryResults = ({
  courses,
  subjectArea,
  query,
}: CatalogNumberQueryResultsProps) => {
  const subjectAreaCourses = getSubjectAreaCourses(courses, subjectArea);

  return (
    <CourseQueryResults
      courses={subjectAreaCourses}
      query={query}
      matcher={matchCourse}
    />
  );
};

export { CatalogNumberQueryResults };
