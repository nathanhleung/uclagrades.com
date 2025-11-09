import { Response } from "@/app/api/courses/route";
import { matchSubjectArea, getSubjectAreaLongName } from "@/app/utils";
import { QueryResults } from "./QueryResults";

type SubjectAreaQueryResultsProps = {
    courses: Response;
    /**
     * The subject area query
     */
    query: string;
    /**
     * Called when the user selects a subject area
     * @param subjectArea the subject area that the user selected
     *  from the query results
     */
    onSelectSubjectArea(subjectArea: string): void;
};

const SubjectAreaQueryResults = ({ courses, query, onSelectSubjectArea }: SubjectAreaQueryResultsProps) => {
    const subjectAreas = Object.keys(courses);

    /**
     * Given a query, returns a function which checks whether a
     * `subjectArea` (short form) could match the `query`.
     *
     * TODO(nathanhleung):
     * - take into account edit distance?
     * - rank results somehow, e.g. "com sci" should be first result
     *   for "cs", not "classics"
     * - stream results, since the last check (nested array) could be expensive?
     * - maybe even just sort by number of courses available
     *
     * @param query the search query
     * @returns a matcher function which accepts a `subjectArea` and
     *  returns whether the given query matches the subject area.
     */

    return (
        <QueryResults
            data={subjectAreas}
            query={query}
            matcher={(query) => matchSubjectArea(query, courses)}
            onSelectResult={onSelectSubjectArea}
            noResultsMessage="No departments found matching your query"
            renderResult={(subjectArea) => {
                const nCourses = Object.values(courses[subjectArea]).length;

                return (
                    <div className="text-black bg-white cursor-pointer p-4 border-t-gray-200 border-t-2">
                        <div className="flex">
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold">{subjectArea}</h3>
                                <p className="text-xs">{getSubjectAreaLongName(subjectArea)}</p>
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl">{nCourses}</h3>
                                <p className="text-xs">{nCourses === 1 ? "course" : "courses"}</p>
                            </div>
                        </div>
                    </div>
                );
            }}
        />
    );
};

export { SubjectAreaQueryResults };
