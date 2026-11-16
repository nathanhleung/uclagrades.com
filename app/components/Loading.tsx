import classNames from "classnames";
import { useEffect, useState } from "react";

type LoadingProps = {
  /**
   * If `true`, all layout-related styles will be removed
   */
  noLayoutStyles?: boolean;
  /**
   * Additional classes to add to the container
   */
  className?: string;
};

const Loading = ({ noLayoutStyles = false, className = "" }: LoadingProps) => {
  const [dotCount, setDotCount] = useState(3);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDotCount((dotCount + 1) % 4);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [dotCount]);

  return (
    <div
      className={classNames(
        !noLayoutStyles && "flex justify-center w-full",
        className,
      )}
    >
      <p
        className={classNames(
          "text-2xl opacity-25 font-bold",
          !noLayoutStyles && "text-left w-44 p-6",
        )}
      >
        Loading
        {".".repeat(dotCount)}
        {/* &nbsp; */}
        {" ".repeat(3 - dotCount)}
      </p>
    </div>
  );
};

export { Loading };
