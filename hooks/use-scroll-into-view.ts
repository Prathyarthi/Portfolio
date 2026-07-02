"use client";

import { useEffect, useRef } from "react";

export function useScrollIntoView<T extends HTMLElement>(
  active: boolean,
  options: ScrollIntoViewOptions = { behavior: "smooth", block: "nearest" }
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    ref.current.scrollIntoView(options);
  }, [active]);

  return ref;
}
