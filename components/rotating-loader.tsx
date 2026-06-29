"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function pickRandomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

export function useRotatingMessage(
  messages: readonly string[],
  intervalMs = 2400,
  active = true
) {
  const [index, setIndex] = useState(() =>
    messages.length > 0 ? pickRandomIndex(messages.length) : 0
  );

  useEffect(() => {
    if (!active || messages.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [messages, intervalMs, active]);

  useEffect(() => {
    if (active && messages.length > 0) {
      setIndex(pickRandomIndex(messages.length));
    }
  }, [active, messages]);

  return messages[index] ?? messages[0] ?? "";
}

type RotatingLoaderProps = {
  messages: readonly string[];
  intervalMs?: number;
  active?: boolean;
  className?: string;
  spinnerClassName?: string;
  messageClassName?: string;
};

export function RotatingLoader({
  messages,
  intervalMs = 2400,
  active = true,
  className,
  spinnerClassName,
  messageClassName,
}: RotatingLoaderProps) {
  const message = useRotatingMessage(messages, intervalMs, active);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-center",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2
        className={cn("h-10 w-10 animate-spin text-brand-primary", spinnerClassName)}
        aria-hidden
      />
      <p
        key={message}
        className={cn(
          "max-w-sm animate-in fade-in-0 duration-300 text-body-sm text-text-secondary",
          messageClassName
        )}
      >
        {message}
      </p>
    </div>
  );
}
