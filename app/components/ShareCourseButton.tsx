"use client";

import { useEffect, useMemo, useState } from "react";

type ShareCourseButtonProps = {
  subjectArea: string;
  catalogNumber: string;
};

/**
 * A share button for a course. Hidden if the user cannot share.
 */
const ShareCourseButton = ({
  subjectArea,
  catalogNumber,
}: ShareCourseButtonProps) => {
  const [canShare, setCanShare] = useState(false);

  const shareData = useMemo(
    () => ({
      title: `${subjectArea} ${catalogNumber} Grade Distribution`,
      text: `2021-23 grade distributions for ${subjectArea} ${catalogNumber}`,
      url: `${process.env.NEXT_PUBLIC_EXTERNAL_HOST}/${encodeURIComponent(
        subjectArea,
      )}/${encodeURIComponent(catalogNumber)}`,
    }),
    [subjectArea, catalogNumber],
  );

  useEffect(() => {
    // Only works over HTTPS
    if (navigator.canShare && navigator.canShare(shareData)) {
      setCanShare(true);
    }
  }, [shareData]);

  if (!canShare) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Share course"
      className="inline-flex items-center justify-center rounded border border-uclaBlue/30 p-3 text-lg text-uclaBlue transition-colors hover:bg-uclaBlue/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uclaBlue"
      onClick={() => {
        navigator.share(shareData);
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="1em"
        viewBox="0 0 576 512"
        className="fill-current"
        aria-hidden="true"
      >
        {/* <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --> */}
        <path d="M352 224H305.5c-45 0-81.5 36.5-81.5 81.5c0 22.3 10.3 34.3 19.2 40.5c6.8 4.7 12.8 12 12.8 20.3c0 9.8-8 17.8-17.8 17.8h-2.5c-2.4 0-4.8-.4-7.1-1.4C210.8 374.8 128 333.4 128 240c0-79.5 64.5-144 144-144h80V34.7C352 15.5 367.5 0 386.7 0c8.6 0 16.8 3.2 23.2 8.9L548.1 133.3c7.6 6.8 11.9 16.5 11.9 26.7s-4.3 19.9-11.9 26.7l-139 125.1c-5.9 5.3-13.5 8.2-21.4 8.2H384c-17.7 0-32-14.3-32-32V224zM80 96c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16H400c8.8 0 16-7.2 16-16V384c0-17.7 14.3-32 32-32s32 14.3 32 32v48c0 44.2-35.8 80-80 80H80c-44.2 0-80-35.8-80-80V112C0 67.8 35.8 32 80 32h48c17.7 0 32 14.3 32 32s-14.3 32-32 32H80z" />
      </svg>
    </button>
  );
};

export { ShareCourseButton };
