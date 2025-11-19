import classNames from "classnames";
import { useCallback, useMemo } from "react";

type QueryResultsProps<T> = {
  /** The search query */
  query: string;
  /** The data to search through */
  data: T[];
  /**
   * A function which extracts a React key from
   * a datum. Defaults to calling `.toString()`.
   */
  keyExtractor?(datum: T): string;
  /**
   * A function which takes in a query and returns another
   * function which returns whether the given datum matches
   * the query or not and a match score. Higher score means
   * higher up in results.
   */
  matcher(query: string): (datum: T) => { matches: boolean; score: number };
  /**
   * Called when the user clicks/selects a result.
   */
  onSelectResult?(result: T): void;
  /**
   * Renders a search result.
   */
  renderResult(datum: T): JSX.Element;
  /**
   * The message to display when no results are found.
   */
  noResultsMessage?: string;
  /**
   * The index that is currently highlighted in the results list.
   */
  activeIndex: number;
};

function QueryResults<T>({
  query,
  matcher,
  data,
  onSelectResult = () => {},
  keyExtractor = (datum) => datum?.toString() ?? "",
  renderResult,
  noResultsMessage = "No results",
  activeIndex,
}: QueryResultsProps<T>) {
  const matcherForQuery = useCallback(matcher(query), [query]);

  const predicate = useCallback(
    (datum: T) => {
      return matcherForQuery(datum).matches;
    },
    [matcherForQuery],
  );

  const results = useMemo(() => {
    return data.filter(predicate).sort((a, b) => {
      const aScore = matcherForQuery(a).score;
      const bScore = matcherForQuery(b).score;

      // Higher is better
      return bScore - aScore;
    });
  }, [data, predicate, matcherForQuery]);

  return (
    <div className="shadow-lg">
      <ul data-query-results>
        {results.map((datum, index) => (
          <li
            key={keyExtractor(datum)}
            onClick={() => onSelectResult(datum)}
            className="bg-uclaBlue"
          >
            <div
              className={classNames(
                "hover:opacity-50",
                index === activeIndex && "sm:opacity-75",
              )}
            >
              {renderResult(datum)}
            </div>
          </li>
        ))}
        {query !== "" && results.length === 0 && (
          <li className="text-black bg-white p-4 border-t-gray-100 border-t-2">
            <div className="flex justify-between">
              <p className="italic font-normal text-gray-400">
                {noResultsMessage}
              </p>
              <a
                className="text-uclaBlue hover:opacity-50"
                target="_blank"
                rel="noopener noreferrer"
                href="https://docs.google.com/forms/d/e/1FAIpQLSfxHpdeTTvFzX4slKx-KGKgvqZM3GfABXIlHcuBHXiKhLhpwQ/viewform?usp=sf_link"
              >
                Report missing data
              </a>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}

export { QueryResults };
