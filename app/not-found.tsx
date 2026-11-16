import Link from "next/link";
import { SearchButton } from "./components/SearchButton";

export default function NotFound() {
  return (
    <main className="flex w-full items-center justify-center px-6 py-20 sm:py-28">
      <div className="w-full max-w-lg text-center">
        <p className="text-8xl font-bold leading-none text-uclaBlue/20 sm:text-9xl">
          404
        </p>
        <h1 className="mt-6 text-3xl font-bold text-uclaDarkerBlue sm:text-4xl">
          This page dropped out.
        </h1>
        <p className="mx-auto mt-4 max-w-sm leading-relaxed text-gray-600">
          We couldn&apos;t find that page. Let&apos;s get you back to finding
          classes.
        </p>
        <div className="mt-8 flex flex-col items-center gap-5">
          <SearchButton className="inline-flex items-center justify-center gap-2 rounded bg-uclaBlue px-6 py-3 font-semibold text-white transition-colors hover:bg-uclaDarkerBlue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uclaDarkerBlue" />
          <Link
            href="/"
            className="rounded text-sm font-semibold text-uclaDarkerBlue underline underline-offset-4 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-uclaDarkerBlue"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
