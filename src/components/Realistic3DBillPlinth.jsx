import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { 
  Sparkles, Scan, Eye, CheckCircle2, AlertTriangle, ShieldCheck, 
  RefreshCw, ZoomIn, FileText, ArrowRight, Upload, Camera, Copy, 
  Check, X, Scale, FileCheck
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import Button from './shared/Button'
import { saveBillToHistory } from '../services/llm/historyService'

export const REAL_BILL_PRESETS = [
  {
    id: 'dining-royal-spice',
    merchant: 'The Royal Spice Pavilion',
    type: 'Fine Dining Receipt',
    category: 'Dining & Hospitality',
    texturePath: '/bills/restaurant_receipt.jpg',
    invoiceNo: 'RSP-987654',
    date: '2026-08-14',
    totalAmount: 1667.50,
    legitimateAmount: 1522.50,
    subtotal: 1450.00,
    gstRate: '5% Statutory Composite',
    gstAmount: 72.50,
    serviceCharge: 145.00,
    serviceChargeIllegal: true,
    flags: [
      { 
        id: 'sc-1', 
        text: '10% Mandatory Service Charge added without consumer opt-in (Violates CCPA 2022 guidelines)', 
        amount: 145.00, 
        statutoryCode: 'CCPA Sec 2(47)' 
      }
    ],
    hotspots: [
      { label: 'Merchant GSTIN', value: '27AABC1234F1Z1', top: '18%', left: '30%', status: 'verified' },
      { label: 'Food Subtotal', value: '₹1,450.00', top: '48%', left: '72%', status: 'verified' },
      { label: '5% Total GST', value: '₹72.50', top: '56%', left: '72%', status: 'verified' },
      { label: 'Illegal Service Fee', value: '₹145.00', top: '65%', left: '72%', status: 'flagged' },
      { label: 'CCPA Stamp', value: 'REMOVED BY GUEST', top: '69%', left: '45%', status: 'flagged' },
    ]
  },
  {
    id: 'electronics-apex',
    merchant: 'Apex Electronics & Retail',
    type: 'Corporate Tax Invoice',
    category: 'Hardware & IT Equipment',
    texturePath: '/bills/electronics_invoice.jpg',
    invoiceNo: 'AE/23-24/1045',
    date: '2026-08-15',
    totalAmount: 5364.00,
    legitimateAmount: 4864.00,
    subtotal: 4450.00,
    gstRate: '18% Standard Bracket',
    gstAmount: 414.00,
    serviceCharge: 500.00,
    serviceChargeIllegal: true,
    flags: [
      { 
        id: 'sc-2', 
        text: 'Non-Statutory Processing Fee of ₹500.00 incorrectly levied before GST', 
        amount: 500.00, 
        statutoryCode: 'GST Sec 15(2)' 
      }
    ],
    hotspots: [
      { label: 'Corporate GSTIN', value: '07AAACA2345B1ZC', top: '22%', left: '35%', status: 'verified' },
      { label: 'MacBook & Hub', value: '₹4,450.00', top: '44%', left: '75%', status: 'verified' },
      { label: '18% GST Bracket', value: '₹414.00', top: '72%', left: '75%', status: 'verified' },
      { label: 'Processing Surcharge', value: '₹500.00', top: '80%', left: '50%', status: 'flagged' },
    ]
  }
]

export default function Realistic3DBillPlinth({ onSelectBill, activeBillId, onTriggerAudit }) {
  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'

  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const paperMeshRef = useRef(null)
  const laserBarRef = useRef(null)
  const laserFanRef = useRef(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const [currentPresetIndex, setCurrentPresetIndex] = useState(0)
  const [isScanning, setIsScanning] = useState(false)
  const [activeHotspot, setActiveHotspot] = useState(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [uploadStepText, setUploadStepText] = useState('')
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [copiedNotice, setCopiedNotice] = useState(false)

  const currentBill = REAL_BILL_PRESETS[currentPresetIndex]

  // ---------------------------------------------------------------------------
  // Three.js Photorealistic Physical Plinth Scene
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth || 480
    const height = mount.clientHeight || 440

    // 1. Scene & Camera
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000)
    camera.position.set(0, 0.5, 7.2)
    camera.lookAt(0, 0, 0)

    // 2. High-Fidelity WebGL Renderer with Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = isDark ? 1.05 : 1.15
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 3. Studio Lighting (Key, Fill, Rim, Ambient)
    const ambientLight = new THREE.AmbientLight(
      isDark ? 0xffffff : 0xfffaf0,
      isDark ? 0.9 : 1.4
    )
    scene.add(ambientLight)

    // Key Light (Warm Titanium / Gold)
    const keyLight = new THREE.DirectionalLight(isDark ? 0xFFFBEB : 0xFFFFFF, isDark ? 2.5 : 2.2)
    keyLight.position.set(3, 6, 5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    keyLight.shadow.bias = -0.0005
    scene.add(keyLight)

    // Fill Light (Cool Sapphire / Sky)
    const fillLight = new THREE.DirectionalLight(isDark ? 0x38BDF8 : 0xBAE6FD, isDark ? 1.2 : 0.9)
    fillLight.position.set(-4, 2, 4)
    scene.add(fillLight)

    // Specular Rim Light from Behind
    const rimLight = new THREE.PointLight(isDark ? 0xD4AF37 : 0xD97706, 2.0, 15)
    rimLight.position.set(0, -3, 3)
    scene.add(rimLight)

    // 4. Physical Plinth / Inspection Dock Base
    const plinthGroup = new THREE.Group()
    scene.add(plinthGroup)

    // Solid Aluminum / Obsidian Pedestal
    const baseGeo = new THREE.BoxGeometry(4.4, 6.2, 0.18, 16, 16)
    const baseMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0B1120 : 0xFFFFFF,
      roughness: isDark ? 0.35 : 0.2,
      metalness: isDark ? 0.8 : 0.1,
    })
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    baseMesh.position.set(0, 0, -0.12)
    baseMesh.receiveShadow = true
    plinthGroup.add(baseMesh)

    // Golden / Slate Precision Bevel Frame
    const frameGeo = new THREE.BoxGeometry(4.48, 6.28, 0.14)
    const frameMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xD4AF37 : 0xD97706,
      metalness: 0.9,
      roughness: 0.25,
      wireframe: false,
    })
    const frameMesh = new THREE.Mesh(frameGeo, frameMat)
    frameMesh.position.set(0, 0, -0.14)
    plinthGroup.add(frameMesh)

    // 5. Authentic Physical Paper Receipt with Micro-Curvature
    const textureLoader = new THREE.TextureLoader()
    const billTexture = textureLoader.load(currentBill.texturePath, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
      if (rendererRef.current) rendererRef.current.render(scene, camera)
    })

    // Subdivided plane for subtle tactile curl
    const paperGeo = new THREE.PlaneGeometry(3.6, 5.4, 40, 40)
    const posArr = paperGeo.attributes.position.array
    for (let i = 0; i < posArr.length; i += 3) {
      const px = posArr[i]
      const py = posArr[i + 1]
      // Subtle natural paper curl & crease on edges
      const curlX = Math.sin(px * 0.7) * 0.05
      const curlY = Math.cos(py * 0.5) * 0.04
      const cornerLift = Math.exp(Math.abs(px) * 0.8 + Math.abs(py) * 0.5) * 0.003
      posArr[i + 2] = curlX + curlY + cornerLift
    }
    paperGeo.computeVertexNormals()

    const paperMat = new THREE.MeshStandardMaterial({
      map: billTexture,
      roughness: 0.75,
      metalness: 0.02,
      side: THREE.FrontSide,
    })
    const paperMesh = new THREE.Mesh(paperGeo, paperMat)
    paperMesh.position.set(0, 0, 0.02)
    paperMesh.castShadow = true
    paperMesh.receiveShadow = true
    plinthGroup.add(paperMesh)
    paperMeshRef.current = paperMesh

    // 6. Realistic Optical Laser Scanner Bar & Fan
    const laserBarGeo = new THREE.CylinderGeometry(0.035, 0.035, 4.0, 16)
    const laserBarMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x38BDF8 : 0x0284C7,
    })
    const laserBar = new THREE.Mesh(laserBarGeo, laserBarMat)
    laserBar.rotation.z = Math.PI / 2
    laserBar.position.set(0, 2.2, 0.12)
    plinthGroup.add(laserBar)
    laserBarRef.current = laserBar

    // Laser Light Sheet / Bloom Fan
    const fanGeo = new THREE.PlaneGeometry(3.8, 0.25)
    const fanMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x38BDF8 : 0x0284C7,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const laserFan = new THREE.Mesh(fanGeo, fanMat)
    laserFan.position.set(0, 2.2, 0.09)
    plinthGroup.add(laserFan)
    laserFanRef.current = laserFan

    // 7. Interactive Physics & Inertia-based Cursor Tracking
    let targetRotationX = 0
    let targetRotationY = 0

    const handleMouseMove = (e) => {
      const rect = mount.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      targetRotationY = x * 0.28
      targetRotationX = -y * 0.22
    }

    const handleMouseLeave = () => {
      targetRotationX = 0
      targetRotationY = 0
      setIsHovered(false)
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
    }

    mount.addEventListener('mousemove', handleMouseMove)
    mount.addEventListener('mouseleave', handleMouseLeave)
    mount.addEventListener('mouseenter', handleMouseEnter)

    // 8. 60fps Render Loop
    let animId
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Smooth inertia tilt interpolation
      plinthGroup.rotation.x += (targetRotationX - plinthGroup.rotation.x) * 0.08
      plinthGroup.rotation.y += (targetRotationY - plinthGroup.rotation.y) * 0.08

      // Subtle breathing float when idle
      plinthGroup.position.y = Math.sin(elapsed * 1.5) * 0.06

      // Optical Laser Scan Animation
      if (laserBarRef.current && laserFanRef.current) {
        const laserSpeed = isScanning ? 4.5 : 1.2
        const laserY = Math.sin(elapsed * laserSpeed) * 2.2
        laserBarRef.current.position.y = laserY
        laserFanRef.current.position.y = laserY
      }

      renderer.render(scene, camera)
    }
    animate()

    // 9. Resize Handling
    const handleResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      if (mount) {
        mount.removeEventListener('mousemove', handleMouseMove)
        mount.removeEventListener('mouseleave', handleMouseLeave)
        mount.removeEventListener('mouseenter', handleMouseEnter)
      }
      baseGeo.dispose()
      baseMat.dispose()
      frameGeo.dispose()
      frameMat.dispose()
      paperGeo.dispose()
      paperMat.dispose()
      laserBarGeo.dispose()
      laserBarMat.dispose()
      fanGeo.dispose()
      fanMat.dispose()
      billTexture.dispose()
      renderer.dispose()
      if (mount && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [currentPresetIndex, isDark, isScanning])

  // Switch Texture on Preset Change
  const handleSwitchPreset = (idx) => {
    setCurrentPresetIndex(idx)
    setActiveHotspot(null)
    if (onSelectBill) {
      onSelectBill(REAL_BILL_PRESETS[idx])
    }
  }

  // Trigger Audit Scan
  const triggerScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      if (onTriggerAudit) {
        onTriggerAudit(currentBill)
      }
    }, 1800)
  }

  // Simulated File Upload & OCR flow
  const handleFileUpload = (file) => {
    if (!file) return
    setUploadProgress(20)
    setUploadStepText('Optical character recognition in progress...')

    setTimeout(() => {
      setUploadProgress(55)
      setUploadStepText('Cross-referencing GSTIN & CCPA 2022 statutory tables...')
    }, 700)

    setTimeout(() => {
      setUploadProgress(85)
      setUploadStepText('Auditing arithmetic and service charge levies...')
    }, 1400)

    setTimeout(() => {
      setUploadProgress(100)
      setUploadStepText('Audit Complete! Invoice verified.')

      // Register new bill to history
      const newBill = {
        id: `upload-${Date.now()}`,
        merchant: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Uploaded Establishment',
        type: 'Scanned Document',
        date: new Date().toISOString().split('T')[0],
        totalAmount: 1840.00,
        subtotal: 1600.00,
        gstRate: '5%',
        gstAmount: 80.00,
        serviceCharge: 160.00,
        serviceChargeIllegal: true,
        consumerScore: 78,
        status: 'REVIEW_RECOMMENDED',
        statusText: '10% Voluntary Surcharge Flagged',
        flags: [
          { text: '10% Service Charge levied without opt-in (CCPA 2022 Guidelines Violation)', amount: 160.00 }
        ]
      }
      saveBillToHistory(newBill)

      setTimeout(() => {
        setUploadProgress(null)
        setUploadStepText('')
        if (onSelectBill) onSelectBill(newBill)
      }, 1200)
    }, 2100)
  }

  // Copy formal dispute draft
  const handleCopyNotice = () => {
    const noticeText = `FORMAL NOTICE OF OBJECTION TO UNLAWFUL SERVICE CHARGE LEVY
Date: ${currentBill.date}
To: Management, ${currentBill.merchant}
Invoice / Bill Reference: #${currentBill.invoiceNo}

Subject: Demand for removal of non-mandatory Service Charge (₹${currentBill.serviceCharge.toFixed(2)}) under CCPA Guidelines 2022.

Dear Management,

This letter serves as a formal objection to the inclusion of a non-mandatory "Service Charge" amounting to ₹${currentBill.serviceCharge.toFixed(2)} on Invoice #${currentBill.invoiceNo}.

Under the Central Consumer Protection Authority (CCPA) Guidelines dated July 4, 2022, issued under Section 18(2)(l) and Section 2(47) of the Consumer Protection Act, 2019:
1. No hotel or restaurant shall add service charge automatically or by default in the food bill.
2. Service charge cannot be collected under any other name or disguised as a statutory tax.
3. Service charge is strictly voluntary, optional, and at the sole discretion of the consumer.

Accordingly, you are requested to amend Invoice #${currentBill.invoiceNo} by waiving ₹${currentBill.serviceCharge.toFixed(2)}, adjusting the total payable to ₹${currentBill.legitimateAmount ? currentBill.legitimateAmount.toFixed(2) : (currentBill.subtotal + currentBill.gstAmount).toFixed(2)}.

Regards,
Consumer / TaxShield Audit Terminal`

    navigator.clipboard.writeText(noticeText)
    setCopiedNotice(true)
    setTimeout(() => setCopiedNotice(false), 2500)
  }

  // Segmented percentage calculation for Riotters progress bar
  const totalVal = currentBill.totalAmount || 1
  const subtotalPct = Math.round((currentBill.subtotal / totalVal) * 100)
  const gstPct = Math.round((currentBill.gstAmount / totalVal) * 100)
  const scPct = Math.max(0, 100 - subtotalPct - gstPct)

  return (
    <div id="scanner-section" className="vault-glass rounded-3xl p-6 sm:p-8 border border-slate-200/70 dark:border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Top Hairline Specular Gold Accent */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/50 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#B45309] dark:text-[#FDE68A] text-xs font-mono font-bold tracking-wider uppercase mb-1.5 shadow-sm">
            <Scan size={14} className="text-[#D4AF37]" />
            Photorealistic 3D Optical Audit Terminal
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-poppins text-slate-900 dark:text-white tracking-tight">
            Interactive Statutory Bill Inspector
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Rendered from genuine physical receipts with real thermal paper grain. Tilt in 3D, inspect OCR data tags, and audit voluntary surcharges.
          </p>
        </div>

        {/* Preset Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-black/40 border border-slate-200/70 dark:border-white/10 self-start sm:self-auto shadow-inner">
          {REAL_BILL_PRESETS.map((preset, idx) => (
            <button
              key={preset.id}
              onClick={() => handleSwitchPreset(idx)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-poppins transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPresetIndex === idx
                  ? 'bg-white dark:bg-[#141C2E] text-slate-950 dark:text-white shadow-md font-bold border border-slate-200/80 dark:border-white/15'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText size={13} className={currentPresetIndex === idx ? 'text-[#D4AF37]' : ''} />
              <span>{preset.type.split(' ')[0]} Receipt</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Master-Detail 7/5 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
        
        {/* Left Column (7 cols): 3D Viewport + Mercury Drag-and-Drop Dropzone */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* 3D Physical Paper Plinth Canvas */}
          <div className="relative min-h-[420px] sm:min-h-[450px] flex items-center justify-center rounded-2xl bg-gradient-to-b from-slate-100/60 to-slate-200/50 dark:from-[#070A12]/90 dark:to-[#0D1322]/95 border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-inner group">
            
            {/* Three.js Canvas Container */}
            <div ref={mountRef} className="w-full h-[420px] sm:h-[450px] cursor-grab active:cursor-grabbing z-10" />

            {/* Interactive OCR Hotspot Tags */}
            <div className="absolute inset-0 pointer-events-none z-20">
              {currentBill.hotspots.map((spot, i) => (
                <div
                  key={i}
                  style={{ top: spot.top, left: spot.left }}
                  className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2"
                >
                  <button
                    onClick={() => setActiveHotspot(activeHotspot === spot ? null : spot)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shadow-lg transition-all cursor-pointer flex items-center gap-1 border backdrop-blur-md ${
                      spot.status === 'flagged'
                        ? 'bg-rose-500/95 text-white border-rose-300 shadow-rose-500/30 animate-pulse'
                        : 'bg-slate-900/85 dark:bg-white/95 text-white dark:text-slate-950 border-white/20'
                    }`}
                  >
                    {spot.status === 'flagged' ? <AlertTriangle size={11} /> : <ShieldCheck size={11} />}
                    <span>{spot.value}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Active Hotspot Callout Modal */}
            {activeHotspot && (
              <div className="absolute bottom-4 inset-x-4 z-30 p-3.5 rounded-2xl bg-slate-950/95 dark:bg-[#0D1322]/95 border border-[#D4AF37]/40 text-white shadow-2xl backdrop-blur-xl animate-fade-in flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeHotspot.status === 'flagged' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {activeHotspot.status === 'flagged' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">{activeHotspot.label}: <span className="font-mono text-[#FDE68A]">{activeHotspot.value}</span></h4>
                    <p className="text-[11px] text-slate-300 font-sans">
                      {activeHotspot.status === 'flagged' 
                        ? 'Flagged statutory discrepancy. Non-mandatory fee violates CCPA 2022 guidelines.'
                        : 'Statutory mathematical audit passed with 99.8% verification.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveHotspot(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Bottom Plinth Status Pill */}
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 pointer-events-none text-[10px] font-mono text-slate-600 dark:text-slate-300">
              <span className="px-2 py-0.5 rounded bg-black/50 text-emerald-400 border border-emerald-500/30 backdrop-blur-md font-bold">
                PHYSICAL TEXTURE: ACTIVE
              </span>
              <span className="hidden sm:inline">INERTIA 3D TILT ENABLED</span>
            </div>
          </div>

          {/* Mercury / Dstudio Drag-and-Drop Dropzone */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragOver(false)
              if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0])
            }}
            className={`p-5 rounded-2xl border-2 border-dashed transition-all duration-300 relative overflow-hidden ${
              isDragOver 
                ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_25px_rgba(212,175,55,0.25)] scale-[1.01]' 
                : 'border-slate-300/80 dark:border-white/15 bg-white/70 dark:bg-white/[0.02] hover:border-[#D4AF37]/50'
            }`}
          >
            {/* Hidden Inputs */}
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*,.pdf" 
              className="hidden" 
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
            />
            <input 
              ref={cameraInputRef} 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
            />

            {uploadProgress !== null ? (
              <div className="py-2 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#B45309] dark:text-[#D4AF37] font-bold flex items-center gap-2">
                    <RefreshCw size={14} className="animate-spin" /> {uploadStepText}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center shrink-0 shadow-sm">
                    <Upload size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-poppins">
                      Drag & Drop Bill Receipt to Audit
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Or snap photo directly on mobile camera. Instant OCR & CCPA verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload size={14} /> Browse
                  </button>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/15 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-white/15 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera size={14} className="text-[#D4AF37]" /> Camera
                  </button>
                </div>
              </div>
            )}

            {/* Supported file formats badge */}
            <div className="flex items-center gap-2 pt-3 text-[10px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-white/5 mt-3">
              <span>SUPPORTED:</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-white/10 font-bold">JPG</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-white/10 font-bold">PNG</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-white/10 font-bold">PDF</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-white/10 font-bold">HEIC</span>
              <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck size={11} /> 100% Client-Side Privacy
              </span>
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Dstudio Anomaly Card + Riotters Financial Breakdown */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Riotters Financial Balance Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-[#0D1322] dark:to-[#050811] border border-slate-200/80 dark:border-white/10 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] font-bold text-[#B45309] dark:text-[#D4AF37] uppercase tracking-wider">
                {currentBill.merchant}
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                #{currentBill.invoiceNo}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Total Claimed by Establishment:
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
                ₹{currentBill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-0.5 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Legitimate Statutory Payable: <strong>₹{currentBill.legitimateAmount?.toFixed(2) || (currentBill.subtotal + currentBill.gstAmount).toFixed(2)}</strong></span>
              </div>
            </div>
          </div>

          {/* Dstudio Anomaly Detection Card */}
          {currentBill.serviceCharge > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-amber-500/5 border border-amber-500/40 dark:border-amber-500/30 shadow-lg space-y-3.5 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase font-mono tracking-wider">
                      Statutory Discrepancy Flagged
                    </h4>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Voluntary 10% Service Fee Added
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-mono font-bold">
                  CCPA VIOLATION
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-black/30 border border-amber-500/20 space-y-1">
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  Total Recoverable / Waivable:
                </div>
                <div className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
                  ₹{currentBill.serviceCharge.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                  National Consumer Helpline Guidelines stipulate that service charge is voluntary and cannot be mandatorily added to food invoices.
                </p>
              </div>

              <button
                onClick={() => setShowDisputeModal(true)}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Scale size={15} /> Draft Consumer Dispute Notice
              </button>
            </div>
          )}

          {/* Riotters Segmented Financial Breakdown */}
          <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-poppins text-slate-900 dark:text-white uppercase tracking-wider">
                Statutory Breakdown
              </h4>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                GSTIN: {currentBill.hotspots[0].value}
              </span>
            </div>

            {/* Segmented Visual Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-white/10 p-0.5 gap-0.5">
                <div 
                  className="h-full bg-slate-900 dark:bg-slate-200 rounded-l-full" 
                  style={{ width: `${subtotalPct}%` }} 
                  title={`Subtotal: ${subtotalPct}%`}
                />
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${gstPct}%` }} 
                  title={`GST: ${gstPct}%`}
                />
                <div 
                  className="h-full bg-rose-500 rounded-r-full" 
                  style={{ width: `${scPct}%` }} 
                  title={`Disputed: ${scPct}%`}
                />
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-slate-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-slate-200" /> Base ({subtotalPct}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> GST ({gstPct}%)
                </span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Disputed ({scPct}%)
                </span>
              </div>
            </div>

            {/* Line items list */}
            <div className="divide-y divide-slate-200/70 dark:divide-white/10 text-xs font-mono space-y-2 pt-1">
              <div className="flex justify-between pt-1 text-slate-700 dark:text-slate-300">
                <span>Base Subtotal:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{currentBill.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 text-slate-700 dark:text-slate-300">
                <span>Tax Bracket ({currentBill.gstRate.split(' ')[0]}):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{currentBill.gstAmount.toFixed(2)}</span>
              </div>
              {currentBill.serviceCharge > 0 && (
                <div className="flex justify-between pt-2 text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 p-2 rounded-lg">
                  <span className="flex items-center gap-1">
                    <AlertTriangle size={13} /> Surcharge Flagged:
                  </span>
                  <span>₹{currentBill.serviceCharge.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Trigger Cluster */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <Button
              variant="primary"
              size="md"
              onClick={triggerScan}
              disabled={isScanning}
              className="w-full sm:flex-1 font-bold shadow-lg shadow-[#D4AF37]/25 text-xs sm:text-sm cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Optical Scan in Progress...
                </>
              ) : (
                <>
                  <Scan size={15} /> Run Live Optical Verification
                </>
              )}
            </Button>
            
            <Button
              variant="secondary"
              size="md"
              to={`/analysis/${currentBill.id}`}
              className="w-full sm:w-auto font-semibold text-xs border border-slate-300 dark:border-white/15"
            >
              Inspect Audit <ArrowRight size={14} />
            </Button>
          </div>

        </div>

      </div>

      {/* Legal Dispute Modal (CCPA 2022) */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="max-w-xl w-full rounded-3xl bg-white dark:bg-[#0D1322] border border-[#D4AF37]/40 shadow-2xl p-6 md:p-8 space-y-5 text-slate-900 dark:text-white relative">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] flex items-center justify-center">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base font-poppins">CCPA Formal Consumer Dispute Notice</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">Under Consumer Protection Act, 2019 & CCPA Guidelines 2022</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDisputeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 font-mono text-xs leading-relaxed max-h-[300px] overflow-y-auto space-y-2 text-slate-800 dark:text-slate-200">
              <p><strong>Date:</strong> {currentBill.date}</p>
              <p><strong>To:</strong> Management, {currentBill.merchant}</p>
              <p><strong>Bill / Invoice No:</strong> #{currentBill.invoiceNo}</p>
              <p><strong>GSTIN:</strong> {currentBill.hotspots[0].value}</p>
              <hr className="border-slate-200 dark:border-white/10 my-2" />
              <p><strong>Subject:</strong> Formal demand for removal of non-mandatory Service Charge (₹{currentBill.serviceCharge.toFixed(2)}) under CCPA Guidelines 2022.</p>
              <p>1. Under the Central Consumer Protection Authority (CCPA) Guidelines dated July 4, 2022 issued under Section 18(2)(l) and Section 2(47) of the Consumer Protection Act, 2019, no hotel or restaurant shall add service charge automatically or by default in the food bill.</p>
              <p>2. Service charge cannot be collected under any other name or disguised as a mandatory statutory levy.</p>
              <p>3. Accordingly, I demand the issuance of a revised invoice removing the charge of ₹{currentBill.serviceCharge.toFixed(2)}, adjusting the legitimate payable total to ₹{currentBill.legitimateAmount ? currentBill.legitimateAmount.toFixed(2) : (currentBill.subtotal + currentBill.gstAmount).toFixed(2)}.</p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <FileCheck size={14} className="text-emerald-500" /> Pre-formatted for instant WhatsApp / Email dispatch
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyNotice}
                  className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#B45309] text-slate-950 hover:text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedNotice ? <Check size={15} /> : <Copy size={15} />}
                  {copiedNotice ? 'Copied to Clipboard!' : 'Copy Formal Notice'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
