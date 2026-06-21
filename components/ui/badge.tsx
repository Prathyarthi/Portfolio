import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-[22px] w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[var(--radius-sm)] border border-transparent px-2.5 py-1 font-mono text-xs font-medium tracking-[0.03em] whitespace-nowrap transition-[color,box-shadow] focus-visible:shadow-[var(--shadow-focus)] [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "bg-brand-light text-brand-dark [a&]:hover:bg-brand-secondary/40",
        brand: "bg-brand-light text-brand-dark [a&]:hover:bg-brand-secondary/40",
        secondary:
          "bg-surface-sunken text-text-secondary [a&]:hover:opacity-90",
        neutral: "bg-surface-sunken text-text-secondary",
        success: "bg-success-bg text-[#00614e] dark:text-success",
        warning: "bg-warning-bg text-[#7a5400] dark:text-warning",
        destructive: "bg-danger-bg text-[#7a2e1a] dark:text-danger",
        danger: "bg-danger-bg text-[#7a2e1a] dark:text-danger",
        outline:
          "border-border-default text-text-primary [a&]:hover:bg-surface-raised",
        ghost: "[a&]:hover:bg-surface-raised [a&]:hover:text-text-primary",
        link: "text-brand-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
