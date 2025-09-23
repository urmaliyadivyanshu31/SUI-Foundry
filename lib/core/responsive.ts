// Responsive design utilities for SuiDentity

// Breakpoint definitions matching Tailwind CSS
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof breakpoints

// Responsive component configurations
export const responsiveConfigs = {
  // Particle system configurations
  particles: {
    mobile: {
      count: 100,
      size: 1.5,
      spread: 15,
      animated: true
    },
    tablet: {
      count: 200,
      size: 2,
      spread: 25,
      animated: true
    },
    desktop: {
      count: 500,
      size: 2,
      spread: 50,
      animated: true
    }
  },

  // 3D cube configurations
  isometricCube: {
    mobile: {
      size: 1,
      animated: true,
      interactive: false
    },
    tablet: {
      size: 1.5,
      animated: true,
      interactive: true
    },
    desktop: {
      size: 2,
      animated: true,
      interactive: true
    }
  },

  // Globe configurations
  globe: {
    mobile: {
      size: 1,
      showNetworks: false,
      interactive: false
    },
    tablet: {
      size: 1.2,
      showNetworks: true,
      interactive: true
    },
    desktop: {
      size: 1.5,
      showNetworks: true,
      interactive: true
    }
  },

  // Grid configurations
  grid: {
    mobile: {
      size: 30,
      opacity: 0.03,
      animated: false
    },
    tablet: {
      size: 40,
      opacity: 0.04,
      animated: true
    },
    desktop: {
      size: 50,
      opacity: 0.05,
      animated: true
    }
  }
}

// Get responsive configuration based on screen size
export function getResponsiveConfig<T extends keyof typeof responsiveConfigs>(
  component: T,
  screenWidth: number
): typeof responsiveConfigs[T]['mobile'] {
  if (screenWidth >= breakpoints.lg) {
    return responsiveConfigs[component].desktop
  } else if (screenWidth >= breakpoints.md) {
    return responsiveConfigs[component].tablet
  } else {
    return responsiveConfigs[component].mobile
  }
}

// Responsive typography scales
export const typographyScale = {
  mobile: {
    'hero-title': 'text-4xl md:text-5xl',
    'hero-subtitle': 'text-lg',
    'section-title': 'text-2xl md:text-3xl',
    'section-subtitle': 'text-base md:text-lg',
    'card-title': 'text-lg md:text-xl',
    'card-description': 'text-sm md:text-base',
    'body': 'text-sm md:text-base',
    'caption': 'text-xs md:text-sm'
  },
  tablet: {
    'hero-title': 'text-5xl md:text-6xl',
    'hero-subtitle': 'text-lg md:text-xl',
    'section-title': 'text-3xl md:text-4xl',
    'section-subtitle': 'text-lg md:text-xl',
    'card-title': 'text-xl md:text-2xl',
    'card-description': 'text-base md:text-lg',
    'body': 'text-base md:text-lg',
    'caption': 'text-sm md:text-base'
  },
  desktop: {
    'hero-title': 'text-5xl md:text-7xl',
    'hero-subtitle': 'text-xl',
    'section-title': 'text-4xl md:text-6xl',
    'section-subtitle': 'text-xl',
    'card-title': 'text-2xl',
    'card-description': 'text-lg',
    'body': 'text-lg',
    'caption': 'text-base'
  }
}

// Responsive spacing utilities
export const spacing = {
  mobile: {
    'section-padding': 'py-12 px-4',
    'container-padding': 'px-4',
    'card-padding': 'p-4',
    'grid-gap': 'gap-4',
    'flex-gap': 'gap-3'
  },
  tablet: {
    'section-padding': 'py-16 px-6',
    'container-padding': 'px-6',
    'card-padding': 'p-6',
    'grid-gap': 'gap-6',
    'flex-gap': 'gap-4'
  },
  desktop: {
    'section-padding': 'py-24 px-6',
    'container-padding': 'px-6',
    'card-padding': 'p-8',
    'grid-gap': 'gap-8',
    'flex-gap': 'gap-6'
  }
}

// Responsive grid configurations
export const gridLayouts = {
  'features-grid': {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-3 lg:grid-cols-4'
  },
  'problems-grid': {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-4'
  },
  'solution-grid': {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-3'
  },
  'dashboard-grid': {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-3 xl:grid-cols-4'
  },
  'stats-grid': {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-4'
  }
}

// Performance-aware responsive configurations
export const performanceConfigs = {
  // Reduce animations on mobile for battery life
  animations: {
    mobile: {
      enableParticles: false,
      enable3D: false,
      enableTransitions: true,
      enableHover: false
    },
    tablet: {
      enableParticles: true,
      enable3D: true,
      enableTransitions: true,
      enableHover: true
    },
    desktop: {
      enableParticles: true,
      enable3D: true,
      enableTransitions: true,
      enableHover: true
    }
  },

  // Reduce quality on lower-end devices
  quality: {
    mobile: {
      pixelRatio: 1,
      shadowQuality: 'low',
      particleCount: 100,
      animationFPS: 30
    },
    tablet: {
      pixelRatio: 1.5,
      shadowQuality: 'medium',
      particleCount: 200,
      animationFPS: 60
    },
    desktop: {
      pixelRatio: 2,
      shadowQuality: 'high',
      particleCount: 500,
      animationFPS: 60
    }
  }
}

// Device detection utilities
export function getDeviceType(screenWidth: number): 'mobile' | 'tablet' | 'desktop' {
  if (screenWidth < breakpoints.md) return 'mobile'
  if (screenWidth < breakpoints.lg) return 'tablet'
  return 'desktop'
}

export function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && 'ontouchstart' in window
}

export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  
  // Check for hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 1
  
  // Check for device memory (if available)
  const memory = (navigator as any).deviceMemory || 4
  
  // Check for connection type (if available)
  const connection = (navigator as any).connection
  const isSlowConnection = connection && (
    connection.effectiveType === '2g' || 
    connection.effectiveType === 'slow-2g'
  )
  
  return cores <= 2 || memory <= 2 || isSlowConnection
}

// Responsive component props helper
export function getResponsiveProps<T>(
  configs: Record<'mobile' | 'tablet' | 'desktop', T>,
  screenWidth: number
): T {
  const deviceType = getDeviceType(screenWidth)
  return configs[deviceType]
}

// CSS-in-JS responsive utilities
export function createResponsiveStyles(
  styles: Record<'mobile' | 'tablet' | 'desktop', React.CSSProperties>
): React.CSSProperties & {
  '@media (min-width: 768px)': React.CSSProperties
  '@media (min-width: 1024px)': React.CSSProperties
} {
  return {
    ...styles.mobile,
    '@media (min-width: 768px)': styles.tablet,
    '@media (min-width: 1024px)': styles.desktop,
  }
}

// Responsive image sizes
export const imageSizes = {
  hero: {
    mobile: '(max-width: 768px) 100vw',
    tablet: '(max-width: 1024px) 50vw',
    desktop: '33vw'
  },
  card: {
    mobile: '(max-width: 768px) 100vw',
    tablet: '(max-width: 1024px) 50vw',
    desktop: '25vw'
  },
  avatar: {
    mobile: '64px',
    tablet: '80px',
    desktop: '96px'
  }
}

// Responsive container classes
export const containerClasses = {
  'max-width': 'max-w-7xl mx-auto',
  'padding': 'px-4 sm:px-6 lg:px-8',
  'section': 'py-12 sm:py-16 lg:py-24',
  'grid': 'grid gap-4 sm:gap-6 lg:gap-8'
}

// Touch-friendly sizing for mobile
export const touchTargets = {
  button: {
    mobile: 'min-h-[44px] min-w-[44px]',
    tablet: 'min-h-[40px] min-w-[40px]',
    desktop: 'min-h-[36px] min-w-[36px]'
  },
  link: {
    mobile: 'min-h-[44px] inline-flex items-center',
    tablet: 'min-h-[40px] inline-flex items-center',
    desktop: 'min-h-[36px] inline-flex items-center'
  }
}