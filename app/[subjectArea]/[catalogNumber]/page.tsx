import { CourseTitle } from "@/app/components/CourseTitle";
import { Distribution } from "@/app/components/Distribution";
import { ShareCourseButton } from "@/app/components/ShareCourseButton";
import { Metadata } from "next";

type Props = {
  params: { subjectArea: string; catalogNumber: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subjectArea, catalogNumber } = params;

  return {
    title: `${decodeURIComponent(subjectArea)} ${decodeURIComponent(
      catalogNumber,
    )}`,
  };
}

export default function Course({
  params,
}: {
  params: { subjectArea: string; catalogNumber: string };
}) {
  const { subjectArea: rawSubjectArea, catalogNumber: rawCatalogNumber } =
    params;
  const subjectArea = decodeURIComponent(rawSubjectArea);
  const catalogNumber = decodeURIComponent(rawCatalogNumber);

  return (
    <main className="flex flex-col w-full">
      <div className="text-center">
        <div className="flex items-center justify-between p-6 sm:p-8 md:p-12">
          <div className="flex flex-1 justify-center items-center">
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-6">
                <a className="text-uclaBlue hover:opacity-50" href={`/`}>
                  Home
                </a>
                <span>/</span>
                <a
                  className="text-uclaBlue hover:opacity-50"
                  href={`/?subjectArea=${rawSubjectArea}`}
                >
                  {subjectArea}
                </a>
                <span>/</span>
                <a
                  className="text-uclaBlue hover:opacity-50"
                  href={`/${rawSubjectArea}/${rawCatalogNumber}`}
                >
                  {catalogNumber}
                </a>
              </div>
              <h1 className="flex flex-1 text-4xl mb-4 font-bold items-center justify-center gap-4">
                {subjectArea} {catalogNumber}
                <ShareCourseButton
                  subjectArea={subjectArea}
                  catalogNumber={catalogNumber}
                />
              </h1>
              <h2 className="flex-1 text-2xl">
                <CourseTitle
                  subjectArea={subjectArea}
                  catalogNumber={catalogNumber}
                />
              </h2>
            </div>
          </div>
        </div>
        <div className="w-full h-auto flex flex-1 justify-center p-4 sm:p-8 md:p-12 text-white bg-uclaBlue">
          <div className="flex flex-col w-full md:w-[65%] lg:w-[60%] xl:w-[50%] md:mx-auto items-center">
            <div className="w-full text-black bg-white shadow-xl p-4 sm:p-12 rounded-xl">
              <Distribution
                subjectArea={subjectArea}
                catalogNumber={catalogNumber}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 mt-8">
              <a
                className="text-md font-bold text-white border-white border-2 hover:opacity-50 p-4 rounded"
                href={`/?subjectArea=${rawSubjectArea}`}
              >
                View more {subjectArea} courses
              </a>
              <a
                className="text-md font-bold text-white border-white border-2 hover:opacity-50 p-4 rounded"
                target="_blank"
                rel="noopener noreferrer"
                href="https://docs.google.com/forms/d/e/1FAIpQLSeVFPZF-0_28UPTVeZH-g2TA9gLlVvNxqDXNsIvIAMSoCJYCQ/viewform?usp=sf_link"
              >
                Report missing data
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
