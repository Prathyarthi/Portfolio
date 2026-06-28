"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type FlowAction = {
  href?: string;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
};

type FlowFooterProps = {
  previous?: FlowAction;
  next?: FlowAction;
  className?: string;
  /** Short hint shown on the left; omit for none. */
  message?: string | null;
  /** Pin navigation above content (`top`) or below (`bottom`, default). */
  placement?: "top" | "bottom";
  /** Extra actions rendered on the right beside previous/next (e.g. import CTA). */
  actions?: ReactNode;
};

export function FlowFooter({
  previous,
  next,
  className,
  message = "Use the buttons below to move through the portfolio flow.",
  placement = "bottom",
  actions,
}: FlowFooterProps) {
  const edgeClass =
    placement === "top"
      ? "border-b border-border-default pb-4"
      : "border-t border-border-default pt-5";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        edgeClass,
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {message ? (
          <div className="text-body-sm text-text-secondary">{message}</div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {previous ? (
          previous.href ? (
            <Button variant="outline" asChild>
              <Link href={previous.href}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {previous.label}
              </Link>
            </Button>
          ) : (
            <Button variant="outline" onClick={previous.onClick} disabled={previous.disabled}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {previous.label}
            </Button>
          )
        ) : null}
        {actions}
        {next ? (
          next.href ? (
            <Button asChild disabled={next.disabled}>
              <Link href={next.href}>
                {next.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button onClick={next.onClick} disabled={next.disabled}>
              {next.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )
        ) : null}
      </div>
    </div>
  );
}