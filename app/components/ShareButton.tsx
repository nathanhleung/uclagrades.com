"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  subjectArea: string;
  catalogNumber: string;
  instructor: string;
  term: string;
  disabled?: boolean;
  variant?: "tab" | "inline";
  className?: string;
};

export function ShareButton({
  subjectArea,
  catalogNumber,
  instructor,
  term,
  disabled,
  variant = "tab",
  className = "relative",
}: Props) {
  const isInline = variant === "inline";
  const [message, setMessage] = useState("");
  const confirmationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (confirmationTimer.current !== null) {
        clearTimeout(confirmationTimer.current);
      }
    };
  }, []);

  async function copy() {
    if (confirmationTimer.current !== null) {
      clearTimeout(confirmationTimer.current);
    }
    const coursePath = `/${encodeURIComponent(subjectArea)}/${encodeURIComponent(catalogNumber)}`;
    const selectionPath = `${coursePath}/${encodeURIComponent(instructor || "~")}/${encodeURIComponent(term)}`;
    const url = new URL(selectionPath, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied.");
      confirmationTimer.current = setTimeout(() => {
        setMessage("");
        confirmationTimer.current = null;
      }, 2000);
    } catch {
      setMessage(`Copy this link: ${url}`);
    }
  }

  return (
    <div className={className}>
      <p
        role="status"
        className={
          message
            ? `absolute z-20 flex w-max max-w-[min(18rem,calc(100vw-5rem))] items-center gap-2 break-all rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs text-gray-600 shadow-lg ${isInline ? "top-full left-1/2 mt-2 -translate-x-1/2" : "left-full top-1/2 ml-3 -translate-y-1/2"}`
            : "sr-only"
        }
      >
        {message === "Link copied." && (
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-uclaBlue"
          >
            <path d="m5 12 4 4 10-10" />
          </svg>
        )}
        <span>{message}</span>
      </p>
      <button
        type="button"
        aria-label="Copy chart link"
        title="Copy chart link"
        disabled={disabled}
        onClick={copy}
        className={`flex shrink-0 items-center justify-center gap-2 border border-uclaBlue/30 bg-white font-semibold text-uclaBlue transition-colors hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-uclaBlue disabled:opacity-50 ${isInline ? "rounded-lg px-3 py-2 text-xs" : "h-12 w-12 rounded-r-xl border-l-0 text-sm shadow-lg sm:w-auto sm:px-4"}`}
      >
        <svg
          aria-hidden="true"
          width={isInline ? 16 : 22}
          height={isInline ? 16 : 22}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 16V3m-5 5 5-5 5 5" />
          <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
        </svg>
        <span
          className={
            isInline
              ? "whitespace-nowrap"
              : "hidden whitespace-nowrap sm:inline"
          }
        >
          Share
        </span>
      </button>
    </div>
  );
}
