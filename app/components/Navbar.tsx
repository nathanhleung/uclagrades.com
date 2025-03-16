"use client";

import { sample } from "lodash";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { DONORS_21F_222, DONORS_22F_23S } from "../constants";
import { Search } from "./search";

const ALL_DONORS = [...DONORS_21F_222, ...DONORS_22F_23S];

const Navbar = () => {
  const [randomDonor, setRandomDonor] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setRandomDonor(sample(ALL_DONORS)?.[0] ?? "");
  }, [pathname]);

  return (
    <>
      <div className="flex items-center justify-between w-full bg-uclaBlue text-white p-3 lg:py-2 select-none">
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
            href="https://docs.google.com/forms/d/e/1FAIpQLSfxHpdeTTvFzX4slKx-KGKgvqZM3GfABXIlHcuBHXiKhLhpwQ/viewform"
            className="font-semibold hover:opacity-50"
          >
            Contact
          </a>
          {pathname !== "/" && (
            <div className="rounded pl-4 pr-8 py-1 bg-white cursor-text hidden lg:block hover:shadow-xl md:min-w-[250px]">
              <div
                className="flex items-center font-bold text-black text-sm opacity-50 gap-4"
                onClick={() => {
                  setSearchModalOpen(true);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="1em"
                  viewBox="0 0 512 512"
                >
                  {/* <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --> */}
                  <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                </svg>
                <p>Search for classes</p>
              </div>
            </div>
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
      {/* https://github.com/reactjs/react-modal/issues/960 */}
      {/* @ts-ignore */}
      <Modal
        isOpen={searchModalOpen}
        onRequestClose={() => {
          setSearchModalOpen(false);
        }}
        bodyOpenClassName="overflow-hidden"
        overlayClassName="fixed inset-0 bg-[rgba(39,116,174,0.95)]"
        className="relative top-[10vh] max-h-[90vh] md:w-[65%] lg:w-[60%] xl:w-[50%] md:mx-auto items-center p-6 sm:p-8 md:p-12 overflow-x-scroll"
      >
        <Search onlyInput />
        <div className="mt-16 flex justify-center">
          <a
            className="text-md font-bold text-white border-white border-2 hover:opacity-50 p-4 rounded cursor-pointer"
            onClick={() => {
              setSearchModalOpen(false);
            }}
          >
            Close
          </a>
        </div>
      </Modal>
    </>
  );
};

export { Navbar };
