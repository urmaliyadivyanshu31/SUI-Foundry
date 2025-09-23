import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 hover-lift bricolage-grotesque",
  {
    variants: {
      variant: {
        default: "glass-card bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/30 glow-purple hover:glow-purple-intense",
        destructive:
          "glass-card bg-red-600/80 hover:bg-red-700/90 text-white border border-red-500/30 focus-visible:ring-red-500/50",
        outline:
          "glass-card border border-white/20 hover:border-purple-400/50 text-white hover:bg-purple-600/20",
        secondary:
          "glass-card bg-white/10 hover:bg-white/20 text-white border border-white/10",
        ghost:
          "hover:bg-white/10 text-white/90 hover:text-white",
        link: "text-purple-400 underline-offset-4 hover:underline hover:text-purple-300",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-12 rounded-lg px-6 has-[>svg]:px-4 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
