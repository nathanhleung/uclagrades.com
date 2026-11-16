"use client";

import { useState } from "react";
import Modal from "react-modal";
import { Search } from "./search";

export function SearchButton({ className }: { className: string }) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={searchModalOpen}
        className={className}
        onClick={() => {
          setSearchModalOpen(true);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="1em"
          viewBox="0 0 512 512"
          className="fill-current"
          aria-hidden="true"
        >
          {/* <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --> */}
          <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
        </svg>
        <span>Search Classes</span>
      </button>
      {/* https://github.com/reactjs/react-modal/issues/960 */}
      {/* @ts-ignore */}
      <Modal
        isOpen={searchModalOpen}
        onRequestClose={() => {
          setSearchModalOpen(false);
        }}
        bodyOpenClassName="overflow-hidden"
        overlayClassName="fixed inset-0 z-50 bg-[rgba(39,116,174,0.95)]"
        contentLabel="Search Classes"
        className="relative top-[10vh] max-h-[75vh] md:w-[65%] lg:w-[60%] xl:w-[50%] md:mx-auto items-center p-6 sm:p-8 md:p-12 overflow-y-auto"
      >
        <button
          type="button"
          aria-label="Close search"
          className="fixed right-4 top-4 inline-flex items-center justify-center p-3 text-white transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uclaGold"
          onClick={() => {
            setSearchModalOpen(false);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="m6 6 12 12M6 18 18 6" />
          </svg>
        </button>
        <Search onlyInput />
        <button
          type="button"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center justify-center rounded border border-white/30 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uclaGold"
          onClick={() => {
            setSearchModalOpen(false);
          }}
        >
          Close
        </button>
      </Modal>
    </>
  );
}
