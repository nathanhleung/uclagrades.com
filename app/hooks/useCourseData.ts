import { useEffect, useState } from "react";
import type { CourseRow } from "../types";

async function getCourseData(subjectArea: string, catalogNumber: string) {
  const res = await fetch(
    `/data/courses/${encodeURIComponent(subjectArea.toUpperCase())}/${encodeURIComponent(catalogNumber.toUpperCase())}.json`,
  );
  if (!res.ok) throw new Error(`Failed to load course data: ${res.status}`);
  const json: CourseRow[] = await res.json();
  return json;
}

function useCourseData(subjectArea: string, catalogNumber: string) {
  const [courseData, setCourseData] = useState<CourseRow[]>([]);

  useEffect(() => {
    getCourseData(subjectArea, catalogNumber).then(setCourseData);
  }, [subjectArea, catalogNumber]);

  return { courseData };
}

export default useCourseData;
