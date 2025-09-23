import { cn } from "@/lib/utils"

interface CustomLoaderProps {
  className?: string
  size?: number
  strokeWidth?: number
  color?: string
}

export function CustomLoader({ 
  className, 
  size = 24, 
  strokeWidth = 2,
  color = "#ffffff"
}: CustomLoaderProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className={cn("inline-block", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="animate-spin"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          id="outline"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: `${circumference * 0.01}px, ${circumference}px`,
            strokeDashoffset: 0,
            animation: 'loader-anim 1.6s linear infinite'
          }}
        />
      </svg>
    </div>
  )
}