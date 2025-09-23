import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all duration-300 bricolage-grotesque overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "glass-card border-purple-500/30 bg-purple-600/20 text-purple-200 [a&]:hover:bg-purple-600/30 glow-purple",
        secondary:
          "glass-card border-white/20 bg-white/10 text-white/90 [a&]:hover:bg-white/20",
        destructive:
          "glass-card border-red-500/30 bg-red-600/20 text-red-200 [a&]:hover:bg-red-600/30",
        outline:
          "border-white/20 text-white/80 [a&]:hover:bg-white/10",
        success:
          "glass-card border-green-500/30 bg-green-600/20 text-green-200 [a&]:hover:bg-green-600/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
