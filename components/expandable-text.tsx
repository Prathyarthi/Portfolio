"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const LINE_CLAMP: Record<number, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

export default function ExpandableText({
  children,
  initialLines = 3,
  buttonClassName,
}: {
  children: ReactNode;
  initialLines?: number;
  buttonClassName?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const clampClass = LINE_CLAMP[initialLines] ?? "line-clamp-3";
  const child = Children.only(children);

  const content =
    isValidElement<{ className?: string }>(child) && !expanded
      ? cloneElement(child, {
          className: cn(child.props.className, clampClass),
        })
      : child;

  return (
    <div>
      {content}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "mt-2 text-xs font-medium text-current/70 underline-offset-2 hover:text-current hover:underline",
          buttonClassName
        )}
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}
