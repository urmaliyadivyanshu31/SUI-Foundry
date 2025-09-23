import { cn } from "@/lib/core/utils"

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) => {
  return (
    <div
      className={cn(
        "grid auto-rows-[16rem] sm:auto-rows-[18rem] lg:auto-rows-[20rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto",
        className,
      )}
    >
      {children}
    </div>
  )
}

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string
  title?: string | React.ReactNode
  description?: string | React.ReactNode
  header?: React.ReactNode
  icon?: React.ReactNode
}) => {
  return (
    <div
      className={cn(
        "group/bento row-span-1 rounded-xl sm:rounded-2xl p-4 sm:p-6 glass-card border border-white/10",
        "hover:border-white/30 hover:shadow-glow-lg",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.02] hover:rotate-1",
        "flex flex-col justify-between space-y-3 sm:space-y-4",
        "relative overflow-hidden",
        className,
      )}
    >
      {header && (
        <div className="mb-3 sm:mb-4 opacity-80 group-hover/bento:opacity-100 transition-opacity duration-300">
          {header}
        </div>
      )}
      
      <div className="space-y-2 sm:space-y-3 group-hover/bento:translate-y-[-2px] transition-transform duration-300">
        {icon && (
          <div className="text-white/80 group-hover/bento:text-white transition-colors duration-300">
            {icon}
          </div>
        )}
        
        {title && (
          <h3 className="mozilla-headline font-semibold text-white text-lg sm:text-xl leading-tight">
            {title}
          </h3>
        )}
        
        {description && (
          <p className="bricolage-grotesque text-white/70 text-sm sm:text-base leading-relaxed group-hover/bento:text-white/90 transition-colors duration-300">
            {description}
          </p>
        )}
      </div>
      
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl sm:rounded-2xl" />
    </div>
  )
}