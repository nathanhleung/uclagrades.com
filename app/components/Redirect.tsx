"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export function Redirect({
  href,
  fallback,
  children,
}: {
  href: string;
  fallback: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isFallbackShown, setIsFallbackShown] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsFallbackShown(true), 5000);
    router.replace(href);
    return () => clearTimeout(timeout);
  }, [href, router]);

  return isFallbackShown ? fallback : children;
}
