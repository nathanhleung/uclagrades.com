import Link from "next/link";

const About = () => {
  return (
    <p className="text-gray-400 text-sm italic text-justify">
      This website is not affiliated with UCLA. Grade distribution data from
      2021–2022 was sourced through a February 2023{" "}
      <a
        target="_blank"
        rel="noreferrer"
        className="text-uclaBlue hover:opacity-50"
        href="https://drive.google.com/file/d/1l-R7LN9jOFUic3b4WTk4WxfDSjGNpuVw/view?usp=sharing"
      >
        public records request
      </a>{" "}
      made under the California Public Records Act.{" "}
      <Link className="text-uclaBlue hover:opacity-50" href="/shoutouts">
        40+
      </Link>{" "}
      UCLA students{" "}
      <a
        className="text-uclaBlue hover:opacity-50"
        target="_blank"
        rel="noreferrer"
        href="https://drive.google.com/file/d/14LuoYaDCPUmts_6igA8rC3AVI2Ntyvqc/view?usp=sharing"
      >
        paid $131.25
      </a>{" "}
      to obtain these records. Grade distribution data from 2022–2023 and
      2024–2025 were sourced similarly.
      <br />
      <br />
      UCLA students can download the data on Google Drive (log into your UCLA
      Google Account to access):{" "}
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
      <br />
      <br />
      Source code for this site is{" "}
      <a
        href="https://github.com/nathanhleung/uclagrades.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-uclaBlue hover:opacity-50"
      >
        on GitHub
      </a>
      ; contributions are welcome and appreciated. Questions, comments, bug
      reports, and feature requests are welcome{" "}
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLSfxHpdeTTvFzX4slKx-KGKgvqZM3GfABXIlHcuBHXiKhLhpwQ/viewform"
        target="_blank"
        rel="noopener noreferrer"
        className="text-uclaBlue hover:opacity-50"
      >
        at this link
      </a>
      .
    </p>
  );
};

export { About };
