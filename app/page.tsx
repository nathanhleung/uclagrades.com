import { Search } from "./components/search";
import Link from "next/link";

// Ranked by page views in the supplied analytics report.
const popularCourses = [
  ["CHEM", "14B"],
  ["CHEM", "14BL"],
  ["CHEM", "14CL"],
  ["CHEM", "14D"],
  ["LIFESCI", "7B"],
  ["LIFESCI", "7C"],
  ["MATH", "31B"],
  ["MATH", "32A"],
  ["MATH", "33A"],
  ["MATH", "115A"],
  ["MATH", "131A"],
  ["PHYSICS", "5A"],
  ["PHYSICS", "5B"],
  ["PHYSICS", "5C"],
  ["PHYSICS", "1A"],
  ["STATS", "100B"],
];

export default function Home() {
  return (
    <main className="flex flex-col w-full">
      <div className="flex flex-col text-center justify-center p-6 sm:p-12 md:p-16 md:w-[75%] lg:w-[55%] md:mx-auto">
        <div className="mb-4">
          <h2 className="inline text-4xl text-uclaDarkerBlue hover:opacity-50 font-bold">
            <Link href="/">uclagrades.com</Link>
          </h2>{" "}
          <h1 className="ml-1 inline text-xl sm:text-2xl font-medium leading-snug text-gray-700">
            is where to find the latest UCLA grade distributions — available by
            course, professor, and quarter.
          </h1>
        </div>
        <p className="text-sm text-gray-400">
          Data available from{" "}
          {[
            "Fall 2021",
            "Winter 2022",
            "Spring 2022",
            "Summer 2022",
            "Fall 2022",
            "Winter 2023",
            "Spring 2023",
            "Summer 2023",
            "Fall 2023",
            "Winter 2024",
            "Spring 2024",
            "Summer 2024",
            "Fall 2024",
            "Winter 2025",
            "Spring 2025",
            "Summer 2025",
            "Fall 2025",
            "Winter 2026",
            "Spring 2026",
          ]
            .toReversed()
            .join(", ")}
        </p>
      </div>

      <div className="w-full h-auto flex flex-1 justify-center p-6 sm:p-8 md:p-12 text-white bg-uclaBlue">
        <div className="flex flex-col justify-center gap-8 w-full md:w-[65%] lg:w-[60%] xl:w-[50%] md:mx-auto">
          <Search />
        </div>
      </div>
      <div className="w-full h-auto flex flex-1 justify-center p-6 sm:p-8 md:p-12 text-white bg-uclaLighterBlue">
        <div className="flex flex-col justify-center gap-8 w-full md:w-[65%] lg:w-[60%] xl:w-[50%] md:mx-auto">
          <nav
            aria-labelledby="popular-courses-heading"
            className="w-full flex gap-2 flex-col"
          >
            <h2
              id="popular-courses-heading"
              className="mb-3 text-center text-lg font-bold"
            >
              or, jump to popular courses
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-2">
              {popularCourses.map(([subjectArea, catalogNumber]) => (
                <li key={`${subjectArea}-${catalogNumber}`}>
                  <Link
                    href={`/${encodeURIComponent(subjectArea)}/${encodeURIComponent(catalogNumber)}`}
                    className="flex items-center justify-center rounded border border-white/30 px-2 py-3 text-center text-sm font-semibold whitespace-nowrap transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uclaGold"
                  >
                    {subjectArea} {catalogNumber}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </main>
  );
}
