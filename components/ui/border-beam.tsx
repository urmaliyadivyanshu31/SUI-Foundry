import { cn } from "@/lib/core/utils"

interface BorderBeamProps {
  className?: string
  size?: number
  duration?: number
  borderWidth?: number
  anchor?: number
  colorFrom?: string
  colorTo?: string
  delay?: number
}

export const BorderBeam = ({
  className,
  size = 200,
  duration = 15,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "#ffffff",
  colorTo = "#ffffff",
  delay = 0,
}: BorderBeamProps) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        "overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-[inherit]",
          "animate-border-beam",
          "opacity-75"
        )}
        style={{
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    </div>
  )
}