"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
};

export function FlowFooter({ previous, next, className }: FlowFooterProps) {
  return (
    <div
      className={`flex flex-col gap-3 border-t border-white/6 pt-5 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}
    >
      <div className="flex-1 text-sm text-muted-foreground">
        Use the buttons below to move through the portfolio flow.
      </div>
      <div className="flex items-center gap-3">
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