import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from '../../context/ThemeContext'

export default function ThreeDBackground() {
  const containerRef = useRef(null)
  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 1. Three.js Scene & Fog for infinite horizon depth
    const scene = new THREE.Scene()
    const fogColor = isDark ? 0x050811 : 0xEAF6FF
    scene.fog = new THREE.FogExp2(fogColor, isDark ? 0.0012 : 0.0009)

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      2500
    )
    camera.position.set(0, 80, 480)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // -------------------------------------------------------------------
    // 2. High-Precision Glow Particle Texture (Mode Adaptive)
    // -------------------------------------------------------------------
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    
    if (isDark) {
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
      gradient.addColorStop(0.2, 'rgba(253, 230, 138, 0.9)')
      gradient.addColorStop(0.55, 'rgba(212, 175, 55, 0.35)')
      gradient.addColorStop(0.85, 'rgba(56, 189, 248, 0.12)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    } else {
      gradient.addColorStop(0, 'rgba(2, 132, 199, 0.95)')
      gradient.addColorStop(0.25, 'rgba(56, 189, 248, 0.8)')
      gradient.addColorStop(0.6, 'rgba(14, 165, 233, 0.35)')
      gradient.addColorStop(0.85, 'rgba(2, 132, 199, 0.1)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    }
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    const particleTexture = new THREE.CanvasTexture(canvas)

    // -------------------------------------------------------------------
    // 3. Floating Gold Stardust & Deep Sapphire Particles
    // -------------------------------------------------------------------
    const particleCount = isDark ? 720 : 520
    const particlePositions = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)

    const colorGold = new THREE.Color(isDark ? 0xD4AF37 : 0x0284C7)
    const colorGoldLight = new THREE.Color(isDark ? 0xFDE68A : 0x38BDF8)
    const colorSapphire = new THREE.Color(isDark ? 0x38BDF8 : 0x0369A1)
    const colorIndigo = new THREE.Color(isDark ? 0x818CF8 : 0x0EA5E9)

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 1900
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 1300
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1700

      const rand = Math.random()
      let c = colorGold
      if (rand > 0.7) c = colorSapphire
      else if (rand > 0.45) c = colorGoldLight
      else if (rand > 0.3) c = colorIndigo

      particleColors[i * 3] = c.r
      particleColors[i * 3 + 1] = c.g
      particleColors[i * 3 + 2] = c.b
    }

    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: isDark ? 4.4 : 3.8,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: isDark ? 0.7 : 0.8,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    })

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)

    // -------------------------------------------------------------------
    // 4. Undulating 3D Quantum Geometric Ground Mesh
    // -------------------------------------------------------------------
    const gridCols = 54
    const gridRows = 54
    const spacing = 36
    const totalGridPoints = gridCols * gridRows

    const gridPositions = new Float32Array(totalGridPoints * 3)
    const gridOrigPositions = new Float32Array(totalGridPoints * 3)
    const gridColors = new Float32Array(totalGridPoints * 3)

    const xOffset = ((gridCols - 1) * spacing) / 2
    const zOffset = ((gridRows - 1) * spacing) / 2
    let gIdx = 0

    const tempColor = new THREE.Color()

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const x = c * spacing - xOffset
        const y = -140
        const z = r * spacing - zOffset - 120

        gridPositions[gIdx * 3] = x
        gridPositions[gIdx * 3 + 1] = y
        gridPositions[gIdx * 3 + 2] = z

        gridOrigPositions[gIdx * 3] = x
        gridOrigPositions[gIdx * 3 + 1] = y
        gridOrigPositions[gIdx * 3 + 2] = z

        // Radial gold -> sapphire transition
        const distNorm = Math.hypot(x, z) / (gridCols * spacing * 0.48)
        if (distNorm < 0.4) {
          tempColor.lerpColors(colorGoldLight, colorGold, distNorm * 2.5)
        } else {
          tempColor.lerpColors(colorGold, colorSapphire, Math.min(1, (distNorm - 0.4) * 2))
        }

        gridColors[gIdx * 3] = tempColor.r
        gridColors[gIdx * 3 + 1] = tempColor.g
        gridColors[gIdx * 3 + 2] = tempColor.b

        gIdx++
      }
    }

    const gridGeometry = new THREE.BufferGeometry()
    gridGeometry.setAttribute('position', new THREE.BufferAttribute(gridPositions, 3))
    gridGeometry.setAttribute('color', new THREE.BufferAttribute(gridColors, 3))

    const gridMaterial = new THREE.PointsMaterial({
      size: isDark ? 3.4 : 2.8,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: isDark ? 0.55 : 0.5,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    })

    const gridMesh = new THREE.Points(gridGeometry, gridMaterial)
    scene.add(gridMesh)

    // 5. Calm Ambient Financial Atmosphere (Wireframes removed for realistic executive focus)

    // -------------------------------------------------------------------
    // 6. High-Performance Mouse Tracking & Camera Parallax
    // -------------------------------------------------------------------
    let targetCameraX = 0
    let targetCameraY = 80
    let mouseWorldX = 0
    let mouseWorldZ = 0
    let isTicking = false

    const handleMouseMove = (e) => {
      if (isTicking) return
      isTicking = true

      requestAnimationFrame(() => {
        const normX = (e.clientX / window.innerWidth) * 2 - 1
        const normY = -(e.clientY / window.innerHeight) * 2 + 1
        targetCameraX = normX * 90
        targetCameraY = 80 + normY * 50
        mouseWorldX = normX * 350
        mouseWorldZ = -normY * 350
        isTicking = false
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    window.addEventListener('resize', handleResize)

    // -------------------------------------------------------------------
    // 7. Smooth 60fps Loop & Visibility Control
    // -------------------------------------------------------------------
    let animationFrameId
    const clock = new THREE.Clock()
    let isTabVisible = true

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden
      if (isTabVisible) {
        clock.start()
        animate()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    if (prefersReducedMotion) {
      renderer.render(scene, camera)
    }

    const animate = () => {
      if (!isTabVisible || prefersReducedMotion) return
      animationFrameId = requestAnimationFrame(animate)

      const elapsed = clock.getElapsedTime()

      // Smooth camera interpolation
      camera.position.x += (targetCameraX - camera.position.x) * 0.04
      camera.position.y += (targetCameraY - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)

      // Fluid ground mesh displacement
      const posAttr = gridGeometry.attributes.position
      const posArr = posAttr.array

      for (let i = 0; i < totalGridPoints; i++) {
        const ox = gridOrigPositions[i * 3]
        const oz = gridOrigPositions[i * 3 + 2]

        // Harmonic spatial wave
        const wave1 = Math.sin(ox * 0.006 + elapsed * 1.1) * 20
        const wave2 = Math.cos(oz * 0.006 + elapsed * 0.9) * 16

        // Cursor impulse
        const dx = ox - mouseWorldX
        const dz = oz - mouseWorldZ
        const distSq = dx * dx + dz * dz
        const cursorElevation = Math.exp(-distSq * 0.0001) * 24

        posArr[i * 3 + 1] = -140 + wave1 + wave2 + cursorElevation
      }
      posAttr.needsUpdate = true

      // Slow orbital ambient drift of stars
      particles.rotation.y = elapsed * 0.015
      particles.rotation.x = Math.sin(elapsed * 0.008) * 0.03

      renderer.render(scene, camera)
    }

    animate()

    // -------------------------------------------------------------------
    // 8. Resource Disposal on Unmount
    // -------------------------------------------------------------------
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      particleGeometry.dispose()
      particleMaterial.dispose()
      gridGeometry.dispose()
      gridMaterial.dispose()
      particleTexture.dispose()

      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [isDark])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-700 ${
        isDark ? 'bg-[#050811]' : 'bg-[#EAF6FF]'
      }`}
    />
  )
}
