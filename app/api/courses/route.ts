import untypedSubjectIndex from "@/app/generated/subject-index.json";
import { BaseCourseRow, CourseRow } from "@/app/types";
import { mapValues, pick } from "lodash";
import { NextResponse } from "next/server";

type SubjectIndex = {
    [subjectArea: string]: {
        [catalogNumber: string]: CourseRow[];
    };
};

const subjectIndex = untypedSubjectIndex as SubjectIndex;

export type CatalogNumbersBySubjectArea = {
    [subjectArea: string]: {
        [catalogNumber: string]: BaseCourseRow & {
            nRows: number;
        };
    };
};

/**
 * TODO(nathanhleung): cache this route (and others that can be cached)
 */
export async function GET() {
    const catalogNumbersBySubjectArea: CatalogNumbersBySubjectArea = {};
    const subjectAreas = Object.keys(subjectIndex);
    for (const subjectArea of subjectAreas) {
        catalogNumbersBySubjectArea[subjectArea] = mapValues(subjectIndex[subjectArea], (rows, key) => {
            return {
                subjectArea,
                ...pick(rows[0], "courseTitle"),
                catalogNumber: key,
                nRows: rows.length,
            };
        });
    }

    return NextResponse.json(catalogNumbersBySubjectArea);
}

export type Response = CatalogNumbersBySubjectArea;
