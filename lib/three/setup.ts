import * as THREE from 'three'

// Three.js scene configuration and utilities
export class ThreeSetup {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera
  renderer: THREE.WebGLRenderer | null = null
  frameId: number | null = null
  
  constructor(
    container: HTMLElement,
    options: {
      camera?: 'perspective' | 'orthographic'
      backgroundColor?: number
      alpha?: boolean
      antialias?: boolean
    } = {}
  ) {
    // Scene setup
    this.scene = new THREE.Scene()
    
    // Camera setup
    const { innerWidth, innerHeight } = window
    const aspect = innerWidth / innerHeight
    
    if (options.camera === 'orthographic') {
      const frustumSize = 10
      this.camera = new THREE.OrthographicCamera(
        (frustumSize * aspect) / -2,
        (frustumSize * aspect) / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
      )
    } else {
      this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
    }
    
    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      alpha: options.alpha ?? true,
      antialias: options.antialias ?? true,
    })
    
    this.renderer.setSize(innerWidth, innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    if (options.backgroundColor !== undefined) {
      this.renderer.setClearColor(options.backgroundColor, options.alpha ? 0 : 1)
    }
    
    // Add renderer to container
    container.appendChild(this.renderer.domElement)
    
    // Handle resize
    this.handleResize = this.handleResize.bind(this)
    window.addEventListener('resize', this.handleResize)
  }
  
  handleResize() {
    if (!this.renderer) return
    
    const { innerWidth, innerHeight } = window
    const aspect = innerWidth / innerHeight
    
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = aspect
    } else if (this.camera instanceof THREE.OrthographicCamera) {
      const frustumSize = 10
      this.camera.left = (frustumSize * aspect) / -2
      this.camera.right = (frustumSize * aspect) / 2
      this.camera.top = frustumSize / 2
      this.camera.bottom = frustumSize / -2
    }
    
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(innerWidth, innerHeight)
  }
  
  animate(callback?: () => void) {
    if (!this.renderer) return
    
    const animate = () => {
      this.frameId = requestAnimationFrame(animate)
      
      if (callback) callback()
      
      this.renderer!.render(this.scene, this.camera)
    }
    
    animate()
  }
  
  dispose() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
    }
    
    window.removeEventListener('resize', this.handleResize)
    
    if (this.renderer) {
      this.renderer.dispose()
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
      }
    }
  }
}

// Utility functions for Three.js
export const ThreeUtils = {
  // Create a wireframe material with purple accent
  createWireframeMaterial(color = 0x8b5cf6, opacity = 0.8) {
    return new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity,
    })
  },
  
  // Create a glassmorphism material
  createGlassMaterial(color = 0x8b5cf6, opacity = 0.2) {
    return new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity,
      shininess: 100,
    })
  },
  
  // Create particle system
  createParticleSystem(count = 1000, size = 2) {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const material = new THREE.PointsMaterial({
      color: 0x8b5cf6,
      size,
      transparent: true,
      opacity: 0.6,
    })
    
    return new THREE.Points(geometry, material)
  },
  
  // Create isometric cube
  createIsometricCube(size = 1, wireframe = false) {
    const geometry = new THREE.BoxGeometry(size, size, size)
    
    const material = wireframe
      ? this.createWireframeMaterial()
      : this.createGlassMaterial()
    
    return new THREE.Mesh(geometry, material)
  },
  
  // Create glowing sphere
  createGlowingSphere(radius = 1, color = 0x8b5cf6) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32)
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
    })
    
    const sphere = new THREE.Mesh(geometry, material)
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(radius * 1.2, 32, 32)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
    })
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    sphere.add(glow)
    
    return sphere
  },
  
  // Animation helpers
  animateFloat(object: THREE.Object3D, amplitude = 0.5, speed = 1) {
    const initialY = object.position.y
    
    return (time: number) => {
      object.position.y = initialY + Math.sin(time * speed) * amplitude
    }
  },
  
  animateRotation(object: THREE.Object3D, axis: 'x' | 'y' | 'z' = 'y', speed = 1) {
    return (time: number) => {
      object.rotation[axis] = time * speed
    }
  },
  
  animatePulse(object: THREE.Object3D, minScale = 0.8, maxScale = 1.2, speed = 1) {
    return (time: number) => {
      const scale = minScale + (maxScale - minScale) * (Math.sin(time * speed) + 1) / 2
      object.scale.setScalar(scale)
    }
  },
}

// Color palette for consistency
export const ThreeColors = {
  purple: {
    primary: 0x8b5cf6,
    secondary: 0xa855f7,
    light: 0xc084fc,
    dark: 0x7c3aed,
  },
  background: 0x000000,
  white: 0xffffff,
  gray: {
    light: 0x6b7280,
    medium: 0x4b5563,
    dark: 0x374151,
  },
}