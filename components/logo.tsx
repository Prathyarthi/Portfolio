import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

type LogoVariant = "default" | "light";

function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt=""
      width={52}
      height={52}
      className={cn("shrink-0", className)}
      aria-hidden
    />
  );
}

type LogoProps = {
  variant?: LogoVariant;
  className?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  showBeta?: boolean;
  href?: string;
};

export function BetaBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border border-border-default bg-surface-raised/80 px-2 py-0.5",
        "text-[10px] font-medium uppercase tracking-[0.22em] text-text-muted",
        className
      )}
    >
      Beta
    </span>
  );
}

export function Logo({
  variant = "default",
  className,
  wordmarkClassName,
  showWordmark = true,
  showBeta = false,
  href = "/",
}: LogoProps) {
  const isLight = variant === "light";

  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2.5", className)}
      aria-label={`${siteConfig.name} home`}
    >
      <LogoMark />
      {showWordmark ? (
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "font-display text-[20px] font-bold tracking-[-0.01em]",
              wordmarkClassName ??
                (isLight ? "text-white" : "text-brand-primary")
            )}
          >
            {siteConfig.name}
          </span>
          {showBeta ? <BetaBadge /> : null}
        </span>
      ) : null}
    </Link>
  );
}

export { LogoMark };
