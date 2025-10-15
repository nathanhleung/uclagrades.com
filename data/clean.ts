import * as csv from "csv";
import fs from "fs";
import { mkdirp } from "mkdirp";
import MultiStream from "multistream";
import path from "path";

type Row = {
  enrollmentTerm: string;
  subjectArea: string;
  catalogNumber: string;
  sectionNumber: string;
  gradeOffered: string;
  gradeCount: string;
  enrollmentTotal: string;
  instructorName: string;
  courseTitle: string;
};

type InstructorIndex = {
  [instructorName: string]: Row[];
};

type SubjectIndex = {
  [subjectArea: string]: {
    [catalogNumber: string]: Row[];
  };
};

const CSV_DATA_DIR = path.resolve(__dirname);

/**
 * Parses the CSV and returns an array of objects corresponding to rows and indexes.
 */
async function parseAndIndexGrades(): Promise<
  [Row[], InstructorIndex, SubjectIndex]
> {
  const rows: Row[] = [];
  const instructorIndex: InstructorIndex = {};
  const subjectIndex: SubjectIndex = {};

  // Newer data uses different column names and is processed separately.
  const oldDataStreams = [
    "header-old.csv",
    "grades-21f-222.csv",
    "grades-22f-23s.csv",
  ].map(
    (filename) => () =>
      fs.createReadStream(path.resolve(CSV_DATA_DIR, filename))
  );

  const oldDataParser = new MultiStream(oldDataStreams).pipe(
    csv.parse({ columns: true })
  );
  for await (const rawRow of oldDataParser) {
    // Column names are defined in `header-old.csv`; they are the
    // same for `21f-222` and `22f-23s` data.
    const row = {
      enrollmentTerm: rawRow["ENROLLMENT TERM"].trim(),
      subjectArea: rawRow["SUBJECT AREA"].trim(),
      catalogNumber: rawRow["CATLG NBR"].trim(),
      sectionNumber: rawRow["SECT NBR"].trim(),
      gradeOffered: rawRow["GRD OFF"].trim(),
      gradeCount: rawRow["GRD COUNT"].trim(),
      enrollmentTotal: rawRow["ENRL TOT"].trim(),
      instructorName: rawRow["INSTR NAME"].trim(),
      courseTitle: rawRow["LONG CRSE TITLE"].trim(),
    };
    rows.push(row);
  }

  const newDataStreams = [
    "header-new.csv",
    "grades-231-24s.csv",
    "grades-241-25s.csv",
  ].map(
    (filename) => () =>
      fs.createReadStream(path.resolve(CSV_DATA_DIR, filename))
  );

  const newDataParser = new MultiStream(newDataStreams).pipe(
    csv.parse({ columns: true })
  );
  for await (const rawRow of newDataParser) {
    // The newer data uses different column names. Defined in `header-new.csv`.
    const row = {
      enrollmentTerm: rawRow["enrl_term_cd"].trim(),
      subjectArea: rawRow["subj_area_cd"].trim(),
      catalogNumber: rawRow["disp_catlg_no"].trim(),
      sectionNumber: rawRow["disp_sect_no"].trim(),
      gradeOffered: rawRow["grd_cd"].trim(),
      gradeCount: rawRow["num_grd"].trim(),
      enrollmentTotal: rawRow["enrl_tot"].trim(),
      instructorName: rawRow["instr_nm"].trim(),
      courseTitle: rawRow["crs_long_ttl"].trim(),
    };
    rows.push(row);
  }

  for (const row of rows) {
    const { instructorName, subjectArea, catalogNumber } = row;

    if (!instructorIndex[instructorName]) {
      instructorIndex[instructorName] = [];
    }
    instructorIndex[instructorName].push(row);

    if (!subjectIndex[subjectArea]) {
      subjectIndex[subjectArea] = {};
    }
    if (!subjectIndex[subjectArea][catalogNumber]) {
      subjectIndex[subjectArea][catalogNumber] = [];
    }
    subjectIndex[subjectArea][catalogNumber].push(row);
  }

  return [rows, instructorIndex, subjectIndex];
}

async function main() {
  console.info("Parsing and cleaning data...");

  const [rows, instructorIndex, subjectIndex] = await parseAndIndexGrades();

  console.info("Parsed and cleaned data! Writing files to app/generated...");

  const generatedDataDir = path.resolve(__dirname, "..", "app", "generated");

  await mkdirp(generatedDataDir);
  await Promise.all([
    fs.promises.writeFile(
      path.resolve(generatedDataDir, "rows.json"),
      JSON.stringify(rows),
      "utf-8"
    ),
    fs.promises.writeFile(
      path.resolve(generatedDataDir, "instructor-index.json"),
      JSON.stringify(instructorIndex),
      "utf-8"
    ),
    fs.promises.writeFile(
      path.resolve(generatedDataDir, "subject-index.json"),
      JSON.stringify(subjectIndex),
      "utf-8"
    ),
  ]);

  console.info("Wrote files to app/generated!");
}

main()
  .then(() => {
    console.log("Completed successfully!");
  })
  .catch((err) => {
    console.error("An error occurred.");
    console.error(err);
  });
