"use client";
import { useEffect, useState } from "react";

/**
 * Returns true when the viewport is narrower than `breakpoint` (default 640 px).
 * Initialises to false (desktop-first) so SSR/hydration output matches.
 */
export function useMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}
