"use client";

import { Input } from "@/app/components/Input";
import { Loading } from "@/app/components/Loading";
import { CatalogNumberQueryResults } from "@/app/components/search/CatalogNumberQueryResults";
import { CourseQueryResults } from "@/app/components/search/CourseQueryResults";
import { InstructorQueryResults } from "@/app/components/search/InstructorQueryResults";
import { SubjectAreaQueryResults } from "@/app/components/search/SubjectAreaQueryResults";
import useCourses from "@/app/hooks/useCourses";
import classNames from "classnames";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

type SearchProps = {
  onlyInput?: boolean;
};

const Search = ({ onlyInput = false }: SearchProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [subjectAreaQuery, setSubjectAreaQuery] = useState("");
  const { courses, instructors, isLoading } = useCourses();

  const [selectedSubjectArea, setSelectedSubjectArea] = useState("");
  const subjectAreaQueryInputRef = useRef<HTMLInputElement>(null);

  const [catalogNumberQuery, setCatalogNumberQuery] = useState("");
  const catalogNumberQueryInputRef = useRef<HTMLInputElement>(null);

  const [isSearchingByInstructor, setIsSearchingByInstructor] = useState(false);
  const [instructorQuery, setInstructorQuery] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const instructorQueryInputRef = useRef<HTMLInputElement>(null);

  const [instructorActiveIndex, setInstructorActiveIndex] = useState(0);
  const [subjectActiveIndex, setSubjectActiveIndex] = useState(0);
  const [courseActiveIndex, setCourseActiveIndex] = useState(0);
  const [catalogActiveIndex, setCatalogActiveIndex] = useState(0);

  const instructorResultsRef = useRef<HTMLUListElement>(null);
  const subjectResultsRef = useRef<HTMLUListElement>(null);
  const courseResultsRef = useRef<HTMLUListElement>(null);
  const catalogResultsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (pathname === "/" && searchParams.has("subjectArea")) {
      setIsSearchingByInstructor(false);
      const subjectAreaParam = searchParams.get("subjectArea") ?? "";
      setSelectedSubjectArea(subjectAreaParam);
      setSubjectAreaQuery(subjectAreaParam);

      // For some reason we need to call `requestAnimationFrame`
      // twice for the `focus` to actually work.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          catalogNumberQueryInputRef.current?.focus();
        });
      });
      return;
    }

    if (pathname === "/" && searchParams.has("instructor")) {
      setIsSearchingByInstructor(true);
      const instructorParam = searchParams.get("instructor") ?? "";
      setSelectedInstructor(instructorParam);
      setInstructorQuery(instructorParam);

      // For some reason we need to call `requestAnimationFrame`
      // twice for the `focus` to actually work.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          instructorQueryInputRef.current?.blur();
        });
      });
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const ref = isSearchingByInstructor
      ? selectedInstructor === ""
        ? instructorResultsRef
        : courseResultsRef
      : selectedSubjectArea === ""
        ? subjectResultsRef
        : catalogResultsRef;

    const activeIndex = isSearchingByInstructor
      ? selectedInstructor === ""
        ? instructorActiveIndex
        : courseActiveIndex
      : selectedSubjectArea === ""
        ? subjectActiveIndex
        : catalogActiveIndex;

    const setActiveIndex = isSearchingByInstructor
      ? selectedInstructor === ""
        ? setInstructorActiveIndex
        : setCourseActiveIndex
      : selectedSubjectArea === ""
        ? setSubjectActiveIndex
        : setCatalogActiveIndex;

    const handler = (e: KeyboardEvent) => {
      const element = ref.current?.children[activeIndex] as
        | HTMLLIElement
        | undefined;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(
          activeIndex + 1,
          ref.current?.childNodes?.length! - 1,
        );
        if (next !== activeIndex) {
          setActiveIndex(next);
          requestAnimationFrame(() => {
            (ref.current?.children[next] as HTMLLIElement).focus();
            // opacity-75 to distinguish between hover?
            (
              ref.current?.children[next - 1]?.firstChild as HTMLLIElement
            ).classList.remove("opacity-75");
            (
              ref.current?.children[next]?.firstChild as HTMLLIElement
            ).classList.add("opacity-75");
          });
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = Math.max(activeIndex - 1, 0);
        if (prev !== activeIndex) {
          setActiveIndex(prev);
          requestAnimationFrame(() => {
            (ref.current?.children[prev] as HTMLLIElement).focus();
            (
              ref.current?.children[prev + 1]?.firstChild as HTMLLIElement
            ).classList.remove("opacity-75");
            (
              ref.current?.children[prev]?.firstChild as HTMLLIElement
            ).classList.add("opacity-75");
          });
        }
      } else if (e.key === "Enter") {
        setActiveIndex(0);
        const maybeLinkElem = element?.querySelector("a");
        if (maybeLinkElem) {
          maybeLinkElem?.click();
        } else {
          element?.click();
        }
      } else {
        setActiveIndex(0);

        requestAnimationFrame(() => {
          if (ref.current?.children[0]) {
            Array.from(ref.current.children).forEach((child) => {
              (child.firstChild as HTMLElement)?.classList.remove("opacity-75");
            });
            (ref.current.children[0].firstChild as HTMLElement)?.classList.add(
              "opacity-75",
            );
          }
        });
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [
    instructorActiveIndex,
    isSearchingByInstructor,
    courseActiveIndex,
    selectedInstructor,
    selectedSubjectArea,
    subjectActiveIndex,
    catalogResultsRef,
    catalogActiveIndex,
  ]);

  let prompt = "";
  if (isSearchingByInstructor) {
    prompt = "I want grade distributions for classes taught by";
  } else {
    if (subjectAreaQuery === "") {
      prompt = "I want grade distributions for classes in the";
    } else if (selectedSubjectArea === "") {
      prompt = "I want grade distributions for classes in";
    } else {
      prompt = "I want the grade distribution for";
    }
  }

  if (isLoading || !courses || !instructors) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col align-center justify-center w-full">
      {!onlyInput && (
        <h1 className="text-2xl lg:text-3xl mb-6 text-center font-bold">
          {prompt}
        </h1>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {isSearchingByInstructor ? (
          <Input
            className="lg:col-span-2"
            type="text"
            ref={instructorQueryInputRef}
            value={selectedInstructor || instructorQuery}
            onChange={(e) => {
              if (selectedInstructor === "") {
                setInstructorQuery(e.target.value);
              }
            }}
            placeholder="Search by professor"
            autoFocus
            onClick={() => {
              if (selectedInstructor !== "") {
                setSelectedInstructor("");
                setInstructorQuery(selectedInstructor);
                setCatalogNumberQuery("");
                instructorQueryInputRef.current?.select();

                if (pathname === "/") {
                  const url = new URL(window.location.href);
                  url.searchParams.delete("instructor");
                  history.pushState({}, "", url);
                }
              }
            }}
          />
        ) : (
          <Input
            className={classNames(
              !selectedSubjectArea && "lg:col-span-2",
              selectedSubjectArea && "rounded-r-none",
            )}
            type="text"
            ref={subjectAreaQueryInputRef}
            value={selectedSubjectArea || subjectAreaQuery}
            onChange={(e) => {
              if (selectedSubjectArea === "") {
                setSubjectAreaQuery(e.target.value);
              }
            }}
            placeholder="Search by department"
            autoFocus
            onClick={() => {
              if (selectedSubjectArea !== "") {
                setSelectedSubjectArea("");
                setSubjectAreaQuery(selectedSubjectArea);
                setCatalogNumberQuery("");
                subjectAreaQueryInputRef.current?.select();

                if (pathname === "/") {
                  const url = new URL(window.location.href);
                  url.searchParams.delete("subjectArea");
                  history.pushState({}, "", url);
                }
              }
            }}
          />
        )}
        {selectedSubjectArea && (
          <input
            className={classNames(
              "p-4 outline-none text-center text-2xl text-black",
              "font-bold shadow-lg disabled:bg-white rounded",
              "rounded-l-none transition-all border-uclaBlue border-b-8 focus:border-uclaGold",
            )}
            type="text"
            ref={catalogNumberQueryInputRef}
            value={catalogNumberQuery}
            autoFocus
            onChange={(e) => setCatalogNumberQuery(e.target.value)}
            placeholder="Course number"
            onKeyDown={(e) => {
              // If the user backspaces and there's nothing in the
              // input, go back to searching for a department.
              if (e.key === "Backspace" && catalogNumberQuery === "") {
                setSelectedSubjectArea("");
                setSubjectAreaQuery(selectedSubjectArea);
                setCatalogNumberQuery("");
                subjectAreaQueryInputRef.current?.focus();

                if (pathname === "/") {
                  const url = new URL(window.location.href);
                  url.searchParams.delete("subjectArea");
                  history.pushState({}, "", url);
                }
              }
            }}
          />
        )}
      </div>
      <div className="mt-6">
        {isSearchingByInstructor &&
          instructorQuery !== "" &&
          selectedInstructor === "" && (
            <InstructorQueryResults
              query={instructorQuery}
              instructors={instructors}
              ref={instructorResultsRef}
              onSelectInstructor={(instructor) => {
                setSelectedInstructor(instructor);

                if (pathname === "/") {
                  const url = new URL(window.location.href);
                  url.searchParams.set("instructor", instructor);
                  history.pushState({}, "", url);
                }
              }}
            />
          )}
        {isSearchingByInstructor && selectedInstructor && (
          <CourseQueryResults
            ref={courseResultsRef}
            courses={Object.keys(instructors[selectedInstructor])
              .map((subjectArea) => {
                return Object.values(
                  instructors[selectedInstructor][subjectArea],
                );
              })
              .flat()}
            query=""
            queryParams={`instructor=${selectedInstructor}`}
            matcher={() => () => ({ matches: true, score: 0 })}
          />
        )}
        {!isSearchingByInstructor &&
          (subjectAreaQuery !== "" && selectedSubjectArea === "" ? (
            <SubjectAreaQueryResults
              courses={courses}
              query={subjectAreaQuery}
              ref={subjectResultsRef}
              onSelectSubjectArea={(subjectArea) => {
                setSelectedSubjectArea(subjectArea);

                if (pathname === "/") {
                  const url = new URL(window.location.href);
                  url.searchParams.set("subjectArea", subjectArea);
                  history.pushState({}, "", url);
                }

                // Wait until next tick to ensure component is mounted
                requestAnimationFrame(() => {
                  catalogNumberQueryInputRef.current?.focus();
                });
              }}
            />
          ) : (
            !onlyInput &&
            subjectAreaQuery === "" && (
              <h1 className="text-2xl lg:text-3xl text-center font-bold">
                department
              </h1>
            )
          ))}
        {selectedSubjectArea && (
          <CatalogNumberQueryResults
            courses={courses}
            subjectArea={selectedSubjectArea}
            query={catalogNumberQuery}
            ref={catalogResultsRef}
          />
        )}
      </div>
      <div className="flex items-center justify-center mt-8">
        <span
          className="text-xs underline hover:opacity-50 cursor-pointer select-none text-white"
          onClick={() => {
            if (pathname === "/") {
              const url = new URL(window.location.href);
              url.searchParams.delete("subjectArea");
              url.searchParams.delete("instructor");
              history.pushState({}, "", url);
            }

            if (isSearchingByInstructor) {
              setSubjectAreaQuery(instructorQuery);
            } else {
              setInstructorQuery(subjectAreaQuery);
            }

            setSelectedSubjectArea("");
            setCatalogNumberQuery("");
            setSelectedInstructor("");

            setIsSearchingByInstructor(!isSearchingByInstructor);

            instructorQueryInputRef.current?.focus();
            subjectAreaQueryInputRef.current?.focus();
          }}
        >
          Search by {isSearchingByInstructor ? "department" : "professor"}{" "}
          instead
        </span>
      </div>
    </div>
  );
};

const SuspendedSearch = (props: SearchProps) => {
  // Need to wrap in `Suspense` because `Search` uses `useSearchParams`
  return (
    <Suspense fallback={<Loading />}>
      <Search {...props} />
    </Suspense>
  );
};

export { SuspendedSearch as Search };
