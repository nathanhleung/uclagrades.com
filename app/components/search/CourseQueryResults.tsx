import { useState } from "react";
import { Loading } from "../Loading";
import { QueryResults } from "./QueryResults";
import { BaseCourseRow } from "@/app/types";

type CourseQueryResultsProps = {
  /**
   * The list of courses we are searching through
   */
  courses: (BaseCourseRow & {
    nRows: number;
  })[];
  /**
   * The query to match against
   */
  query: string;
  /**
   * Query params to append to the course result links
   */
  queryParams?: string;
  /**
   * The matcher function to use
   */
  matcher(query: string): (row: BaseCourseRow & { nRows: number }) => {
    matches: boolean;
    score: number;
  };
  activeIndex: number;
};

const CourseQueryResults = ({
  courses,
  query,
  queryParams,
  matcher,
  activeIndex,
}: CourseQueryResultsProps) => {
  return (
    <QueryResults
      data={courses}
      query={query}
      matcher={matcher}
      keyExtractor={(it) => it.catalogNumber}
      noResultsMessage="No courses found matching your query"
      activeIndex={activeIndex}
      renderResult={(row) => {
        return <Result row={row} queryParams={queryParams} />;
      }}
    />
  );
};

type ResultProps = {
  row: BaseCourseRow & {
    nRows: number;
  };
  queryParams?: string;
};

const Result = ({ row, queryParams }: ResultProps) => {
  const [clicked, setClicked] = useState(false);
  const nRows = row.nRows;

  return (
    <a
      href={`/${row.subjectArea}/${row.catalogNumber}${queryParams ? `?${queryParams}` : ""}`}
      onClick={() => {
        setClicked(true);

        // Fixes bug Pranav was experiencing on mobile
        // where the loading state would stay stuck
        setTimeout(() => {
          setClicked(false);
        }, 500);
      }}
    >
      <div className="text-black bg-white cursor-pointer p-4 border-t-gray-100 border-t-2">
        <div className="flex">
          <div className="flex-1">
            <div>
              <h3 className="text-xl font-bold">
                {row.subjectArea} {row.catalogNumber}
              </h3>
              <p className="text-md">{row.courseTitle}</p>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end">
            {clicked ? (
              <Loading noLayoutStyles className="w-28" />
            ) : (
              <div className="text-center min-w-[100px]">
                <h3 className="text-2xl">
                  {nRows > 50 ? "great" : nRows > 10 ? "good" : "limited"}
                </h3>
                <p className="text-xs">data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </a>
  );
};

export { CourseQueryResults };
