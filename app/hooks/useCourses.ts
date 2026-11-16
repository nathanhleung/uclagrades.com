import { addDays, isBefore } from "date-fns";
import { useEffect, useState } from "react";
import type { Response as CoursesResponse } from "../data/courses.json/route";
import type { Response as InstructorsResponse } from "../data/instructors.json/route";

/**
 * Gets the generated static course index
 *
 * @returns a list of courses is JSON format
 */
async function getCourses() {
  const res = await fetch("/data/courses.json");
  if (!res.ok) throw new Error(`Failed to load courses: ${res.status}`);
  const json: CoursesResponse = await res.json();
  return json;
}

/**
 * Gets the generated static instructor index
 *
 * @returns a list of instructors is JSON format
 */
async function getInstructors() {
  const res = await fetch("/data/instructors.json");
  if (!res.ok) throw new Error(`Failed to load instructors: ${res.status}`);
  const json: InstructorsResponse = await res.json();
  return json;
}

function useCourses() {
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courses, setCourses] = useState<CoursesResponse>();

  const [isLoadingInstructors, setIsLoadingInstructors] = useState(true);
  const [instructors, setInstructors] = useState<InstructorsResponse>();

  useEffect(() => {
    const cachedCourses = window.localStorage.getItem(
      `courses-${process.env.NEXT_PUBLIC_COMMIT_HASH ?? "dev"}`,
    );
    const cachedCoursesExpiration = new Date(
      window.localStorage.getItem(
        `courses-expiration-${process.env.NEXT_PUBLIC_COMMIT_HASH ?? "dev"}`,
      ) ?? 0,
    );
    const now = new Date();

    if (cachedCourses && isBefore(now, cachedCoursesExpiration)) {
      setCourses(JSON.parse(cachedCourses) as any);
      setIsLoadingCourses(false);
    } else {
      getCourses()
        .then((json) => {
          setCourses(json);
          window.localStorage.setItem(
            `courses-${process.env.NEXT_PUBLIC_COMMIT_HASH ?? "dev"}`,
            JSON.stringify(json),
          );
          window.localStorage.setItem(
            `courses-expiration-${process.env.NEXT_PUBLIC_COMMIT_HASH ?? "dev"}`,
            addDays(now, 1).toISOString(),
          );
        })
        .finally(() => {
          setIsLoadingCourses(false);
        });
    }
  }, []);

  useEffect(() => {
    const cachedInstructors = window.localStorage.getItem(
      `instructors-${process.env.NEXT_PUBLIC_COMMIT_HASH ?? "dev"}`,
    );
    const cachedInstructorsExpiration = new Date(
      window.localStorage.getItem(
        `instructors-expiration-${process.env.NEXT_PUBLIC_COMMIT_HASH ?? "dev"}`,
      ) ?? 0,
    );
    const now = new Date();

    if (cachedInstructors && isBefore(now, cachedInstructorsExpiration)) {
      setInstructors(JSON.parse(cachedInstructors) as any);
      setIsLoadingInstructors(false);
    } else {
      getInstructors()
        .then((json) => {
          setInstructors(json);
          window.localStorage.setItem(
            `instructors-${process.env.NEXT_PUBLIC_COMMIT_HASH ?? "dev"}`,
            JSON.stringify(json),
          );
          window.localStorage.setItem(
            `instructors-expiration-${process.env.NEXT_PUBLIC_COMMIT_HASH ?? "dev"}`,
            addDays(now, 1).toISOString(),
          );
        })
        .finally(() => {
          setIsLoadingInstructors(false);
        });
    }
  }, []);

  const isLoading = isLoadingCourses && isLoadingInstructors;

  return { courses, instructors, isLoading };
}

export default useCourses;
