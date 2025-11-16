import { Response } from "@/app/api/instructors/route";
import { getSubjectAreaLongName } from "@/app/utils";
import { QueryResults } from "./QueryResults";
import { forwardRef, Ref } from "react";

type InstructorQueryResultsProps = {
  instructors: Response;
  /**
   * The instructor query
   */
  query: string;
  /**
   * Called when the user selects a instructor
   * @param instructor the instructor that the user selected
   *  from the query results
   */
  onSelectInstructor(instructor: string): void;
};

const InstructorQueryResults = forwardRef<
  HTMLUListElement,
  InstructorQueryResultsProps
>(({ instructors, query, onSelectInstructor }, ref) => {
  const instructorNames = Object.keys(instructors);

  function matchInstructor(query: string) {
    const normalizedQuery = query.toLowerCase().trim();

    if (normalizedQuery === "") {
      return () => ({
        matches: false,
        score: 0,
      });
    }

    return (instructorName: string) => {
      const matches =
        instructorName.toLowerCase().indexOf(normalizedQuery) !== -1;
      const nCourses = Object.values(instructors[instructorName]).reduce(
        (acc, subjectAreaCourses) => {
          return acc + Object.keys(subjectAreaCourses).length;
        },
        0
      );

      return {
        matches,
        score: nCourses,
      };
    };
  }

  return (
    <QueryResults
      ref={ref}
      data={instructorNames}
      query={query}
      matcher={(query) => matchInstructor(query)}
      onSelectResult={onSelectInstructor}
      noResultsMessage="No professors found matching your query"
      renderResult={(instructorName) => {
        const departments = Object.keys(instructors[instructorName]);
        const nCourses = Object.values(instructors[instructorName]).reduce(
          (acc, subjectAreaCourses) => {
            return acc + Object.keys(subjectAreaCourses).length;
          },
          0
        );

        return (
          <div className="text-black bg-white cursor-pointer p-4 border-t-gray-200 border-t-2">
            <div className="flex">
              <div className="flex-1">
                <h3 className="text-2xl font-bold">
                  {instructorName.split(", ").toReversed().join(" ")}
                </h3>
                <p className="text-xs">{departments.join(", ")}</p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl">{nCourses}</h3>
                <p className="text-xs">
                  {nCourses === 1 ? "course" : "courses"}
                </p>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
});

InstructorQueryResults.displayName = "InstructorQueryResults";

export { InstructorQueryResults };
