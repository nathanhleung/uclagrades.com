import Image from "next/image";

export default function About() {
  return (
    <main className="flex flex-col w-full">
      <div className="flex flex-1 flex-col justify-center p-6 sm:p-12 md:p-16 pb-0 sm:pb-0 md:pb-0 md:max-w-[85%] lg:max-w-[60%] md:mx-auto">
        <h1 className="text-4xl text-center mb-6 text-black font-bold">
          About
        </h1>
        <div className="bg-gray-100 p-12 my-8 italic">
          Log into your UCLA Google Account and download the raw grade
          distribution data here:{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1kF7eK8Iyyv_LnE2IY9vg2VEuDuoYi5qO/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-uclaBlue hover:opacity-50"
          >
            Fall 2021–Summer 2022
          </a>
          ,{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1QTdQIRb1YvJ91zPkwaPTmxzRuy8GK_YN/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-uclaBlue hover:opacity-50"
          >
            Fall 2022–Spring 2023
          </a>
          ,{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/13HGfffKLACEfCcVGNshu8Y_dfNip2kA2/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-uclaBlue hover:opacity-50"
          >
            Summer 2023–Spring 2024
          </a>
          ,{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1BIHfuZpi9SvhuBXdI2fHPGIILpj1sAAk/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-uclaBlue hover:opacity-50"
          >
            Summer 2024–Spring 2025
          </a>
        </div>
        <div className="text-justify">
          <p>
            On February 15th, 2023, I sent a{" "}
            <a
              href="https://www.finance.ucla.edu/tax-records/records-management/how-to-request-public-records"
              target="_blank"
              rel="noopener noreferrer"
              className="text-uclaBlue hover:opacity-50"
            >
              California Public Records Act request to UCLA
            </a>{" "}
            for 2021–22 grade distributions.
          </p>
          <a
            href="https://drive.google.com/file/d/1l-R7LN9jOFUic3b4WTk4WxfDSjGNpuVw/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="block my-12 hover:opacity-50"
          >
            <Image
              className="w-full h-auto shadow-lg"
              width={0}
              height={0}
              sizes="100vw"
              src="/docs/request.png"
              alt="Initial request letter"
            />
          </a>
          <p>
            Two weeks later, UCLA responded asking for $130 for the records.
          </p>
          <a
            href="https://drive.google.com/file/d/14LuoYaDCPUmts_6igA8rC3AVI2Ntyvqc/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="block my-12 hover:opacity-50"
          >
            <Image
              className="w-full h-auto shadow-lg"
              width={0}
              height={0}
              sizes="100vw"
              src="/docs/billing.png"
              alt="Billing letter"
            />
          </a>
          <p>
            <a className="text-uclaBlue hover:opacity-50" href="/shoutouts">
              40+ UCLA students
            </a>{" "}
            crowdfunded $130 and we sent a check to UCLA Information Practices.
          </p>
          <a
            href="https://old.reddit.com/r/ucla/comments/11m8orw/fall_2021_winter_2022_spring_2022_and_summer_2022/"
            target="_blank"
            rel="noopener noreferrer"
            className="block my-12 hover:opacity-50"
          >
            <Image
              className="w-full h-auto shadow-lg"
              width={0}
              height={0}
              sizes="100vw"
              src="/docs/fundraising.png"
              alt="Fundraising reddit post"
            />
          </a>
          <p>UCLA responded, promising the records by April 14th.</p>
          <a
            href="https://drive.google.com/file/d/1Bm0AgTOpQ19UH2Fcyj7dA0e1KRzKlimm/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="block my-12 hover:opacity-50"
          >
            <Image
              className="w-full h-auto shadow-lg"
              width={0}
              height={0}
              sizes="100vw"
              src="/docs/availability.png"
              alt="Letter of estimated availability"
            />
          </a>
          <p>
            After two months of delays, UCLA finally responded with the records
            on June 16th.
          </p>
          <a
            href="https://drive.google.com/file/d/11Byo-93okW-jowbkUCFk-7Bh-55muC9B/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="block my-12 hover:opacity-50"
          >
            <Image
              className="w-full h-auto shadow-lg"
              width={0}
              height={0}
              sizes="100vw"
              src="/docs/response.png"
              alt="Response letter"
            />
          </a>
          <p>
            This website was developed over the course of a few weeks in late
            June and early July. Source code for this site is{" "}
            <a
              href="https://github.com/nathanhleung/uclagrades.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-uclaBlue hover:opacity-50"
            >
              on GitHub
            </a>
            ; contributions are welcome and appreciated.
            <br />
            <br />
            The grade distribution data is available for UCLA students to
            download on the UCLA Google Drive (log into your UCLA Google Account
            to access):{" "}
            <a
              href="https://docs.google.com/spreadsheets/d/1kF7eK8Iyyv_LnE2IY9vg2VEuDuoYi5qO/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-uclaBlue hover:opacity-50"
            >
              Fall 2021–Summer 2022
            </a>
            ,{" "}
            <a
              href="https://docs.google.com/spreadsheets/d/1QTdQIRb1YvJ91zPkwaPTmxzRuy8GK_YN/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-uclaBlue hover:opacity-50"
            >
              Fall 2022–Spring 2023
            </a>
            ,{" "}
            <a
              href="https://docs.google.com/spreadsheets/d/13HGfffKLACEfCcVGNshu8Y_dfNip2kA2/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-uclaBlue hover:opacity-50"
            >
              Summer 2023–Spring 2024
            </a>
            ,{" "}
            <a
              href="https://docs.google.com/spreadsheets/d/1BIHfuZpi9SvhuBXdI2fHPGIILpj1sAAk/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-uclaBlue hover:opacity-50"
            >
              Summer 2024–Spring 2025
            </a>
          </p>
          <a
            href="https://docs.google.com/spreadsheets/u/1/d/1kF7eK8Iyyv_LnE2IY9vg2VEuDuoYi5qO/edit?usp=sharing&ouid=105052985987772221837&rtpof=true&sd=true"
            target="_blank"
            rel="noopener noreferrer"
            className="block my-12 hover:opacity-50"
          >
            <Image
              className="w-full h-auto shadow-lg"
              width={0}
              height={0}
              sizes="100vw"
              src="/docs/sheets.png"
              alt="Responsive documents"
            />
          </a>
        </div>
      </div>
    </main>
  );
}
