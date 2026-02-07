import Marquee from "react-fast-marquee";
import { About } from "./components/About";
import { GoogleAnalytics } from "./components/GoogleAnalytics";
import { MobileNavbar } from "./components/MobileNavbar";
import { Navbar } from "./components/Navbar";
import "./globals.css";

export const metadata = {
  title: {
    template: "%s | UCLA Grade Distributions 2021-25",
    default: "UCLA Grade Distributions 2021-25",
  },
  description:
    "Grade distribution data was sourced through a public records request made under the California Public Records Act. 40+ UCLA students paid $131.25 to obtain these records.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
      </head>
      <body className="flex flex-col min-h-screen border-b-uclaBlue border-b-[12px]">
        <div className="w-full py-2 bg-green-500 select-none">
          <Marquee autoFill pauseOnHover speed={20}>
            <p className="px-12 uppercase font-bold">
              🚦Help make Westwood Blvd safer:{" "}
              <a
                href="https://winstli.com/westwood?utm_source=uclagrades.com"
                className="underline"
              >
                Show Your Support
              </a>{" "}
              🚦
            </p>
          </Marquee>
        </div>
        <div className="hidden md:block">
          <Navbar />
        </div>
        <div className="md:hidden">
          <MobileNavbar />
        </div>
        <div className="flex flex-1">{children}</div>
        <div className="flex flex-col text-center p-6 sm:p-12 md:p-16 md:w-[85%] lg:w-[60%] md:mx-auto justify-center">
          <About />
        </div>
      </body>
    </html>
  );
}
