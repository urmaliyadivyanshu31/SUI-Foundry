'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface AnimatedSectionProps {
  children: React.ReactNode
  animation?: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scale' | 'stagger'
  delay?: number
  duration?: number
  stagger?: number
  className?: string
  trigger?: 'top' | 'center' | 'bottom'
}

export default function AnimatedSection({
  children,
  animation = 'fadeUp',
  delay = 0,
  duration = 1,
  stagger = 0.1,
  className = '',
  trigger = 'top'
}: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!sectionRef.current) return
    
    const section = sectionRef.current
    const elements = section.children
    
    // Set initial state
    gsap.set(elements, getInitialState(animation))
    
    // Create animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: `${trigger} 80%`,
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      }
    })
    
    // Add animation based on type
    switch (animation) {
      case 'fadeUp':
        tl.to(elements, {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: 'power2.out'
        })
        break
        
      case 'fadeLeft':
        tl.to(elements, {
          opacity: 1,
          x: 0,
          duration,
          delay,
          stagger,
          ease: 'power2.out'
        })
        break
        
      case 'fadeRight':
        tl.to(elements, {
          opacity: 1,
          x: 0,
          duration,
          delay,
          stagger,
          ease: 'power2.out'
        })
        break
        
      case 'scale':
        tl.to(elements, {
          opacity: 1,
          scale: 1,
          duration,
          delay,
          stagger,
          ease: 'back.out(1.7)'
        })
        break
        
      case 'stagger':
        tl.to(elements, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          delay,
          stagger,
          ease: 'power2.out'
        })
        break
    }
    
    return () => {
      tl.kill()
    }
  }, [animation, delay, duration, stagger, trigger])
  
  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  )
}

function getInitialState(animation: string) {
  switch (animation) {
    case 'fadeUp':
      return { opacity: 0, y: 50 }
    case 'fadeLeft':
      return { opacity: 0, x: -50 }
    case 'fadeRight':
      return { opacity: 0, x: 50 }
    case 'scale':
      return { opacity: 0, scale: 0.8 }
    case 'stagger':
      return { opacity: 0, y: 30, scale: 0.9 }
    default:
      return { opacity: 0, y: 50 }
  }
}

// Micro-interaction hook for hover effects
export function useHoverGlow(intensity = 'normal') {
  const ref = useRef<HTMLElement>(null)
  
  useEffect(() => {
    if (!ref.current) return
    
    const element = ref.current
    
    const handleMouseEnter = () => {
      gsap.to(element, {
        boxShadow: intensity === 'intense' 
          ? '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.2)'
          : '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)',
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
    
    const handleMouseLeave = () => {
      gsap.to(element, {
        boxShadow: '0 0 0px rgba(139, 92, 246, 0)',
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
    
    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [intensity])
  
  return ref
}

// Parallax scroll effect
export function useParallax(speed = 0.5) {
  const ref = useRef<HTMLElement>(null)
  
  useEffect(() => {
    if (!ref.current) return
    
    const element = ref.current
    
    gsap.to(element, {
      yPercent: -50 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === element) {
          trigger.kill()
        }
      })
    }
  }, [speed])
  
  return ref
}

// Text reveal animation
export function useTextReveal() {
  const ref = useRef<HTMLElement>(null)
  
  useEffect(() => {
    if (!ref.current) return
    
    const element = ref.current
    const text = element.textContent || ''
    
    // Split text into characters
    element.innerHTML = text
      .split('')
      .map(char => `<span class="char" style="opacity: 0; transform: translateY(20px)">${char === ' ' ? '&nbsp;' : char}</span>`)
      .join('')
    
    const chars = element.querySelectorAll('.char')
    
    gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    }).to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.05,
      stagger: 0.02,
      ease: 'power2.out'
    })
    
    return () => {
      element.innerHTML = text
    }
  }, [])
  
  return ref
}