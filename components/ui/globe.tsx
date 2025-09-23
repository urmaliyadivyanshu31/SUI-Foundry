'use client'

import { useEffect, useRef } from 'react'
import createGlobe from 'cobe'
import { useSpring } from 'react-spring'

export function Globe({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  
  const [{ r }, api] = useSpring(() => ({
    r: 0,
    config: {
      mass: 1,
      tension: 280,
      friction: 60,
      precision: 0.001,
    },
  }))
  
  useEffect(() => {
    let phi = 0
    let width = 0
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth
      }
    }
    window.addEventListener('resize', onResize)
    onResize()
    
    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 3,
      mapSamples: 16000,
      mapBrightness: 1.2,
      baseColor: [0.4, 0.3, 0.7], // Purple tint
      markerColor: [0.8, 0.6, 1], // Light purple markers
      glowColor: [0.4, 0.3, 0.7], // Purple glow
      markers: [
        { location: [37.7749, -122.4194], size: 0.1 }, // San Francisco
        { location: [40.7128, -74.0060], size: 0.1 },  // New York
        { location: [51.5074, -0.1278], size: 0.1 },   // London
        { location: [35.6762, 139.6503], size: 0.1 },  // Tokyo
        { location: [1.3521, 103.8198], size: 0.1 },   // Singapore
        { location: [-33.8688, 151.2093], size: 0.1 }, // Sydney
      ],
      onRender: (state) => {
        // Auto rotate
        if (!pointerInteracting.current) {
          phi += 0.003
        }
        state.phi = phi + r.get()
        state.width = width * 2
        state.height = width * 2
      },
    })
    
    return () => {
      globe.destroy()
      window.removeEventListener('resize', onResize)
    }
  }, [r])
  
  return (
    <div 
      style={{
        width: '100%',
        maxWidth: '600px',
        aspectRatio: '1',
        margin: '0 auto',
        position: 'relative'
      }}
      className={className}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'grab',
          contain: 'layout paint size',
          opacity: 0.8,
          transition: 'opacity 1s ease'
        }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current
          if (canvasRef.current) {
            canvasRef.current.style.cursor = 'grabbing'
          }
        }}
        onPointerUp={() => {
          pointerInteracting.current = null
          if (canvasRef.current) {
            canvasRef.current.style.cursor = 'grab'
          }
        }}
        onPointerOut={() => {
          pointerInteracting.current = null
          if (canvasRef.current) {
            canvasRef.current.style.cursor = 'grab'
          }
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current
            pointerInteractionMovement.current = delta
            api.start({
              r: delta / 200,
            })
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current
            pointerInteractionMovement.current = delta
            api.start({
              r: delta / 100,
            })
          }
        }}
      />
    </div>
  )
}