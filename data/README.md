# Data

## Grade Distributions

The `grades-*.csv` files contain grade distribution data obtained from UCLA's Public Records Office through public records requests. The `header-old.csv` and `header-new.csv` files provide column names for the corresponding grade CSV formats.

`clean.ts` parses and cleans the grade CSVs, then writes the rows and course and instructor indexes to `app/generated/` for use by the site's API.

## Course Details

`get-course-details.ts` fetches all subjects and their course details from UCLA's public course API and generates `course-details.csv` if it does not already exist. Subsequent runs reuse the CSV; delete it to fetch a fresh catalog. It preserves the raw API fields: `subj_area_cd`, `subj_area_nm`, `course_title`, `unt_rng`, `crs_career_lvl_nm`, and `crs_desc`. The course number is included in `course_title`. This CSV is separate from the grade data for joining course details later.

The script also generates `app/generated/course-details-index.json`, indexed by trimmed subject code and the course number before the first `. ` in `course_title`. Each course key contains an array of records to preserve multiple descriptions, including future-effective versions. After loading or downloading the raw CSV, `get-course-details.ts` adds derived fields in memory, then creates the index. The CSV retains the original snake_case field names. The index converts them to camelCase (`subjAreaCd`, `subjAreaNm`, `rawCourseTitle`, `untRng`, `crsCareerLvlNm`, and `crsDesc`) without changing their values. The normalized course fields use the same names as `BaseCourseRow` in `app/types.ts` and the other generated indexes:

- `subjectArea`: trimmed `subj_area_cd`, used as the subject index key.
- `catalogNumber`: course number before the first `. ` in `course_title`, used as the course index key.
- `courseTitle`: title after that separator, trimmed. The original title, including the course number, is retained as `rawCourseTitle`.
- `cleanedDescription`: `crs_desc` with catalog logistics removed.

Description cleanup removes recognizable hours, requisites, enrollment restrictions, cross-listings, grading, and credit notes. This is heuristic: unfamiliar text is retained, and descriptions containing only logistics become empty. The CSV retains the full original text. Course pages import the index directly.

Run both scripts with:

```bash
yarn generate
```
