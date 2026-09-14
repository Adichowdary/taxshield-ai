import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Shield, Sparkles, CheckCircle2 } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function Hero3DQuantumVault() {
  const mountRef = useRef(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth || 500
    const height = mount.clientHeight || 500

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 8.5)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = isDark ? 1.2 : 1.4
    mount.appendChild(renderer.domElement)

    // -------------------------------------------------------------------
    // 2. Lighting Rig (Gold Aurum & Precision Sapphire)
    // -------------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.8 : 1.3)
    scene.add(ambientLight)

    // Dynamic mouse-following gold light
    const goldLight = new THREE.PointLight(isDark ? 0xFDE68A : 0xD97706, isDark ? 3.5 : 2.8, 30)
    goldLight.position.set(3, 4, 5)
    scene.add(goldLight)

    // Secondary sapphire rim light
    const sapphireLight = new THREE.PointLight(isDark ? 0x38BDF8 : 0x0284C7, isDark ? 3.0 : 2.4, 30)
    sapphireLight.position.set(-4, -3, -2)
    scene.add(sapphireLight)

    // Tertiary subtle emerald base glow
    const emeraldLight = new THREE.PointLight(0x10B981, isDark ? 1.8 : 1.4, 20)
    emeraldLight.position.set(0, -4, 2)
    scene.add(emeraldLight)

    // -------------------------------------------------------------------
    // 3. Central 3D Quantum Vault Group
    // -------------------------------------------------------------------
    const vaultGroup = new THREE.Group()
    scene.add(vaultGroup)

    // A. Outer Geodesic Crystal Facets (The Shield Crust)
    const outerGeo = new THREE.IcosahedronGeometry(2.1, 1)
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x1E293B : 0xF1F5F9,
      emissive: isDark ? 0x0A0F1D : 0xE2E8F0,
      roughness: isDark ? 0.15 : 0.12,
      metalness: isDark ? 0.85 : 0.35,
      transmission: isDark ? 0.45 : 0.65,
      ior: 1.5,
      thickness: 1.2,
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    })
    const outerMesh = new THREE.Mesh(outerGeo, outerMat)
    vaultGroup.add(outerMesh)

    // B. Crystal Wireframe Facet Grid
    const wireGeo = new THREE.IcosahedronGeometry(2.12, 1)
    const wireMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xD4AF37 : 0xB45309,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.38 : 0.5,
    })
    const wireMesh = new THREE.Mesh(wireGeo, wireMat)
    vaultGroup.add(wireMesh)

    // C. Inner Sovereign Gold Core (Faceted Octahedron)
    const innerGeo = new THREE.OctahedronGeometry(1.05, 0)
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      emissive: isDark ? 0xB45309 : 0xD97706,
      emissiveIntensity: isDark ? 0.65 : 0.45,
      roughness: 0.2,
      metalness: 0.95,
    })
    const innerCore = new THREE.Mesh(innerGeo, innerMat)
    vaultGroup.add(innerCore)

    // D. Concentric Orbital Holographic Rings
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: isDark ? 0xD4AF37 : 0xB45309,
      transparent: true,
      opacity: isDark ? 0.55 : 0.65,
      side: THREE.DoubleSide,
    })
    const ringGeo1 = new THREE.TorusGeometry(2.7, 0.02, 16, 100)
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1)
    ring1.rotation.x = Math.PI * 0.35
    vaultGroup.add(ring1)

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: isDark ? 0x38BDF8 : 0x0284C7,
      transparent: true,
      opacity: isDark ? 0.5 : 0.6,
      side: THREE.DoubleSide,
    })
    const ringGeo2 = new THREE.TorusGeometry(3.05, 0.018, 16, 100)
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2)
    ring2.rotation.y = Math.PI * 0.4
    vaultGroup.add(ring2)

    // E. Orbiting Energy Nodes / Halo Particles
    const haloCount = 60
    const haloGeo = new THREE.BufferGeometry()
    const haloPos = new Float32Array(haloCount * 3)
    for (let i = 0; i < haloCount; i++) {
      const angle = (i / haloCount) * Math.PI * 2
      const radius = 2.85 + (Math.random() - 0.5) * 0.4
      haloPos[i * 3] = Math.cos(angle) * radius
      haloPos[i * 3 + 1] = (Math.random() - 0.5) * 0.8
      haloPos[i * 3 + 2] = Math.sin(angle) * radius
    }
    haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPos, 3))
    const haloMat = new THREE.PointsMaterial({
      color: isDark ? 0xFDE68A : 0xB45309,
      size: 0.08,
      transparent: true,
      opacity: isDark ? 0.85 : 0.9,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    })
    const haloPoints = new THREE.Points(haloGeo, haloMat)
    vaultGroup.add(haloPoints)

    // -------------------------------------------------------------------
    // 4. Interactive Drag & Momentum Physics
    // -------------------------------------------------------------------
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0
    let targetRotX = 0.2
    let targetRotY = 0.3
    let velocityX = 0
    let velocityY = 0

    const onPointerDown = (e) => {
      isDragging = true
      setIsInteracting(true)
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onPointerMove = (e) => {
      const rect = mount.getBoundingClientRect()
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)

      // Move specular gold light with cursor
      goldLight.position.x = normX * 5
      goldLight.position.y = normY * 5

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX
        const deltaY = e.clientY - prevMouseY
        velocityX = deltaX * 0.007
        velocityY = deltaY * 0.007
        targetRotY += velocityX
        targetRotX += velocityY
        prevMouseX = e.clientX
        prevMouseY = e.clientY
      } else {
        // Ambient subtle hover tilt
        targetRotY += normX * 0.002
        targetRotX -= normY * 0.002
      }
    }

    const onPointerUp = () => {
      isDragging = false
      setTimeout(() => setIsInteracting(false), 800)
    }

    mount.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    // Resize Observer for fluid responsiveness
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        const h = entry.contentRect.height
        if (w > 0 && h > 0) {
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        }
      }
    })
    resizeObserver.observe(mount)

    // -------------------------------------------------------------------
    // 5. 60 FPS Render Loop with Harmonic Spin & Damping
    // -------------------------------------------------------------------
    let animId
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Automatic gentle idle rotation
      if (!isDragging) {
        targetRotY += 0.0045
        targetRotX = Math.sin(elapsed * 0.45) * 0.18
      }

      // Smooth interpolation (lerp)
      vaultGroup.rotation.y += (targetRotY - vaultGroup.rotation.y) * 0.08
      vaultGroup.rotation.x += (targetRotX - vaultGroup.rotation.x) * 0.08

      // Inner core independent counter-rotation
      innerCore.rotation.y = -elapsed * 0.7
      innerCore.rotation.z = Math.sin(elapsed * 0.8) * 0.4

      // Rings planetary spin
      ring1.rotation.z = elapsed * 0.35
      ring2.rotation.x = -elapsed * 0.28
      haloPoints.rotation.y = elapsed * 0.15

      // Breathing scale pulse
      const breathe = 1 + Math.sin(elapsed * 1.5) * 0.02
      innerCore.scale.set(breathe, breathe, breathe)

      renderer.render(scene, camera)
    }

    animate()

    // -------------------------------------------------------------------
    // 6. Cleanup on Unmount
    // -------------------------------------------------------------------
    return () => {
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      mount.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)

      outerGeo.dispose()
      outerMat.dispose()
      wireGeo.dispose()
      wireMat.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      ringGeo1.dispose()
      ringMat1.dispose()
      ringGeo2.dispose()
      ringMat2.dispose()
      haloGeo.dispose()
      haloMat.dispose()

      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [isDark])

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] flex items-center justify-center select-none">
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none z-10"
        title="Click and drag to rotate 3D Quantum Vault"
      />

      {/* Radial Ambient Gold & Sapphire Backlight */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
        <div className="w-[320px] h-[320px] rounded-full bg-gradient-to-tr from-[#D4AF37]/15 to-[#38BDF8]/15 blur-[90px] animate-pulse" />
      </div>

      {/* Floating 3D Holographic Statutory Audit Chips */}
      <div className="absolute -top-3 right-4 sm:right-12 z-20 pointer-events-none transform transition-all duration-300 hover:scale-105">
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl vault-glass border border-[#D4AF37]/40 shadow-xl backdrop-blur-xl">
          <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] dark:text-[#FDE68A]">
            <Shield size={16} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 font-mono">STATUTORY FIDELITY</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
              5% GST Rule Verified <CheckCircle2 size={12} className="text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-2 sm:left-6 z-20 pointer-events-none transform transition-all duration-300 hover:scale-105">
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl vault-glass border border-[#38BDF8]/40 shadow-xl backdrop-blur-xl">
          <div className="w-7 h-7 rounded-lg bg-[#38BDF8]/20 border border-[#38BDF8]/40 flex items-center justify-center text-[#0284C7] dark:text-[#38BDF8]">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 font-mono">CCPA 2022 MANDATE</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
              Zero Compulsory Surcharges
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 -left-2 sm:-left-6 -translate-y-1/2 z-20 pointer-events-none hidden md:block">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl vault-glass border border-emerald-500/30 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-300">100% Deterministic Engine</span>
        </div>
      </div>

      {/* Interactive Micro-hint */}
      <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none z-20">
        <span className="text-[10px] font-mono tracking-widest text-slate-600 dark:text-slate-400/80 uppercase px-3 py-1 rounded-full bg-slate-200/80 dark:bg-black/40 border border-slate-300 dark:border-white/10 backdrop-blur-md">
          {isInteracting ? '✦ FREE 3D ROTATION ACTIVE' : 'DRAG TO ROTATE 3D VAULT CORE'}
        </span>
      </div>
    </div>
  )
}
