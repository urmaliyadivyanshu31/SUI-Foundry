// Performance optimization utilities for SuiDentity

import { useEffect, useState, useCallback, useRef } from 'react'
import { gsap } from 'gsap'

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const targetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = targetRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      const isVisible = entry.isIntersecting
      setIsIntersecting(isVisible)
      
      if (isVisible && !hasIntersected) {
        setHasIntersected(true)
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    })

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [hasIntersected, options])

  return { targetRef, isIntersecting, hasIntersected }
}

// Debounced resize hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Responsive hook
export function useResponsive() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  })

  const debouncedResize = useCallback(() => {
    setScreenSize({
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024,
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      debouncedResize()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [debouncedResize])

  return screenSize
}

// Performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measure = () => {
      frameCount++
      const currentTime = performance.now()
      const deltaTime = currentTime - lastTime

      if (deltaTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / deltaTime)
        
        // Memory usage (if available)
        const memory = (performance as any).memory
        const memoryUsage = memory 
          ? Math.round(memory.usedJSHeapSize / 1024 / 1024)
          : 0

        setMetrics({
          fps,
          memoryUsage,
          renderTime: Math.round(deltaTime / frameCount)
        })

        frameCount = 0
        lastTime = currentTime
      }

      animationId = requestAnimationFrame(measure)
    }

    animationId = requestAnimationFrame(measure)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return metrics
}

// Optimized animation hook
export function useOptimizedAnimation(
  enabled: boolean = true,
  reducedMotion: boolean = false
) {
  const [shouldAnimate, setShouldAnimate] = useState(enabled && !reducedMotion)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => {
      setShouldAnimate(enabled && !mediaQuery.matches)
    }

    handleChange()
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [enabled])

  return shouldAnimate
}

// Three.js performance optimization
export class ThreePerformanceManager {
  private renderer: THREE.WebGLRenderer | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.Camera | null = null
  private isVisible: boolean = true
  private targetFPS: number = 60
  private frameTime: number = 1000 / this.targetFPS

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) {
    this.renderer = renderer
    this.scene = scene
    this.camera = camera
  }

  // Adaptive quality based on performance
  adaptiveQuality(currentFPS: number) {
    if (currentFPS < 30) {
      // Reduce quality
      this.renderer?.setPixelRatio(Math.min(window.devicePixelRatio * 0.5, 1))
      // Reduce particle count, shadows, etc.
    } else if (currentFPS > 55) {
      // Increase quality
      this.renderer?.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
  }

  // Frustum culling optimization
  enableFrustumCulling() {
    if (this.scene && this.camera) {
      this.scene.traverse((object) => {
        if (object.type === 'Mesh') {
          object.frustumCulled = true
        }
      })
    }
  }

  // LOD (Level of Detail) management
  createLOD(
    highDetailMesh: THREE.Mesh,
    mediumDetailMesh: THREE.Mesh,
    lowDetailMesh: THREE.Mesh
  ) {
    const lod = new THREE.LOD()
    lod.addLevel(highDetailMesh, 0)
    lod.addLevel(mediumDetailMesh, 50)
    lod.addLevel(lowDetailMesh, 100)
    return lod
  }

  // Visibility-based rendering
  setVisibility(visible: boolean) {
    this.isVisible = visible
    if (this.renderer) {
      if (visible) {
        this.renderer.setAnimationLoop(this.render.bind(this))
      } else {
        this.renderer.setAnimationLoop(null)
      }
    }
  }

  private render() {
    if (this.renderer && this.scene && this.camera && this.isVisible) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  // Cleanup
  dispose() {
    if (this.renderer) {
      this.renderer.setAnimationLoop(null)
      this.renderer.dispose()
    }
  }
}

// GSAP performance optimization
export function optimizeGSAP() {
  // Set global GSAP settings for better performance
  gsap.config({
    force3D: true,
    nullTargetWarn: false,
    trialWarn: false
  })

  // Use batch updates for better performance
  gsap.ticker.fps(60)
}

// Image lazy loading utility
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
        img.src = url
      })
    })
  )
}

// Web Worker utility for heavy computations
export function createWorker(fn: (...args: unknown[]) => unknown): Worker {
  const blob = new Blob([`(${fn.toString()})()`], { type: 'application/javascript' })
  return new Worker(URL.createObjectURL(blob))
}

// Resource cleanup utility
export class ResourceManager {
  private resources: Set<() => void> = new Set()

  add(cleanup: () => void) {
    this.resources.add(cleanup)
  }

  remove(cleanup: () => void) {
    this.resources.delete(cleanup)
  }

  cleanup() {
    this.resources.forEach(cleanup => cleanup())
    this.resources.clear()
  }
}

// Initialize performance optimizations
export function initializePerformanceOptimizations() {
  // Optimize GSAP
  optimizeGSAP()

  // Preload critical images
  const criticalImages = [
    // Add any critical image URLs here
  ]
  
  if (criticalImages.length > 0) {
    preloadImages(criticalImages).catch(console.warn)
  }

  // Enable performance observer if available
  if (typeof PerformanceObserver !== 'undefined') {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          console.log('Page load time:', entry.duration)
        }
      })
    })

    observer.observe({ entryTypes: ['navigation', 'paint'] })
  }
}