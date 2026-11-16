"use client";

import { sample } from "lodash";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DONORS_21F_222, DONORS_22F_23S } from "../constants";
import { SearchButton } from "./SearchButton";

const ALL_DONORS = [...DONORS_21F_222, ...DONORS_22F_23S];

const Navbar = () => {
  const [randomDonor, setRandomDonor] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    setRandomDonor(sample(ALL_DONORS)?.[0] ?? "");
  }, [pathname]);

  return (
    <>
      <div className="flex items-center justify-between w-full min-h-[48px] bg-uclaBlue text-white p-3 lg:py-2 select-none">
        <div className="flex items-center gap-12">
          <Link href="/" className="font-bold hover:opacity-50">
            uclagrades.com
          </Link>
          <Link href="/" className="font-semibold hover:opacity-50">
            Home
          </Link>
          <Link href="/about" className="font-semibold hover:opacity-50">
            About
          </Link>
          <a
            target="blank"
            rel="noopener noreferrer"
            href="https://docs.google.com/forms/d/e/1FAIpQLSeVFPZF-0_28UPTVeZH-g2TA9gLlVvNxqDXNsIvIAMSoCJYCQ/viewform"
            className="font-semibold hover:opacity-50"
          >
            Contact
          </a>
          {pathname !== "/" && (
            <SearchButton className="hidden lg:inline-flex shrink-0 items-center justify-center gap-2 rounded border border-white bg-white px-3 py-1 text-center text-sm font-semibold text-gray-500 whitespace-nowrap transition-colors hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uclaGold" />
          )}
        </div>
        <div>
          {randomDonor && (
            <Link className="hover:opacity-50" href="/shoutouts">
              Shoutout to {randomDonor}
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export { Navbar };
