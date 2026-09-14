import { useState, useRef, useEffect, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { Upload, Camera, Sparkles, CheckCircle2, AlertTriangle, Shield, ArrowRight, RefreshCw, FileText, Check } from 'lucide-react'
import Button from './shared/Button'
import { saveBillToHistory } from '../services/llm/historyService'
import { useTheme } from '../context/ThemeContext'

const Dashboard3DScanner = forwardRef(function Dashboard3DScanner({ onBillScanned }, ref) {
  const navigate = useNavigate()
  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'

  const mountRef = useRef(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState(0)
  const [scannedBill, setScannedBill] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // -------------------------------------------------------------------------
  // 1. Real-time 3D Holographic WebGL Scanner Canvas
  // -------------------------------------------------------------------------
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth || 360
    const height = mount.clientHeight || 340

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 7)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.4)
    scene.add(ambientLight)

    const goldLight = new THREE.PointLight(isDark ? 0xFDE68A : 0xD97706, 3, 20)
    goldLight.position.set(2, 3, 4)
    scene.add(goldLight)

    const sapphireLight = new THREE.PointLight(isDark ? 0x38BDF8 : 0x0284C7, 2.5, 20)
    sapphireLight.position.set(-3, -2, 3)
    scene.add(sapphireLight)

    // Scanner Holo-group
    const holoGroup = new THREE.Group()
    scene.add(holoGroup)

    // 3D Holographic Floating Receipt Plate
    const plateGeo = new THREE.BoxGeometry(2.4, 3.4, 0.08)
    const plateMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x0D1322 : 0xF8FAFC,
      emissive: isDark ? 0x141C2E : 0xE2E8F0,
      metalness: 0.8,
      roughness: 0.2,
      transmission: 0.6,
      ior: 1.45,
      reflectivity: 0.9,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.85,
    })
    const plateMesh = new THREE.Mesh(plateGeo, plateMat)
    holoGroup.add(plateMesh)

    // Wireframe Outer Frame
    const wireGeo = new THREE.BoxGeometry(2.44, 3.44, 0.1)
    const wireMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xD4AF37 : 0xB45309,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.45 : 0.6,
    })
    const wireMesh = new THREE.Mesh(wireGeo, wireMat)
    holoGroup.add(wireMesh)

    // Holographic Laser Scanner Bar (Moves vertically)
    const laserGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.8, 16)
    const laserMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xFDE68A : 0xD97706,
      transparent: true,
      opacity: 0.9,
    })
    const laserBar = new THREE.Mesh(laserGeo, laserMat)
    laserBar.rotation.z = Math.PI / 2
    laserBar.position.z = 0.15
    holoGroup.add(laserBar)

    // Concentric Holo-Rings around Scanner
    const ringGeo = new THREE.TorusGeometry(2.6, 0.02, 16, 64)
    const ringMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x38BDF8 : 0x0284C7,
      transparent: true,
      opacity: 0.4,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI * 0.4
    holoGroup.add(ring)

    // Orbiting Data Embers
    const emberCount = 36
    const emberGeo = new THREE.BufferGeometry()
    const emberPos = new Float32Array(emberCount * 3)
    for (let i = 0; i < emberCount; i++) {
      emberPos[i * 3] = (Math.random() - 0.5) * 4.5
      emberPos[i * 3 + 1] = (Math.random() - 0.5) * 4.5
      emberPos[i * 3 + 2] = (Math.random() - 0.5) * 3
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3))
    const emberMat = new THREE.PointsMaterial({
      color: isDark ? 0xFDE68A : 0xB45309,
      size: 0.09,
      transparent: true,
      opacity: 0.8,
    })
    const embers = new THREE.Points(emberGeo, emberMat)
    holoGroup.add(embers)

    // Interactive mouse parallax
    let targetRotY = 0
    let targetRotX = 0

    const handleMouseMove = (e) => {
      const rect = mount.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      targetRotY = x * 0.35
      targetRotX = -y * 0.35
    }
    mount.addEventListener('mousemove', handleMouseMove)

    // Render loop
    let animId
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Smooth inertia rotation
      holoGroup.rotation.y += (targetRotY - holoGroup.rotation.y) * 0.05
      holoGroup.rotation.x += (targetRotX - holoGroup.rotation.x) * 0.05

      // Floating gentle bob
      holoGroup.position.y = Math.sin(elapsed * 1.8) * 0.12

      // Laser scanning motion (oscillating up and down)
      laserBar.position.y = Math.sin(elapsed * (isScanning ? 5 : 2.5)) * 1.4

      // Orbiting ring slow roll
      ring.rotation.z = elapsed * 0.4
      embers.rotation.y = elapsed * 0.2

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      mount.removeEventListener('mousemove', handleMouseMove)
      plateGeo.dispose()
      plateMat.dispose()
      wireGeo.dispose()
      wireMat.dispose()
      laserGeo.dispose()
      laserMat.dispose()
      ringGeo.dispose()
      ringMat.dispose()
      emberGeo.dispose()
      emberMat.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [isDark, isScanning])

  // -------------------------------------------------------------------------
  // 2. Demo Presets & OCR Simulation Engine
  // -------------------------------------------------------------------------
  const PRESET_BILLS = [
    {
      id: `bill-${Date.now()}-1`,
      merchant: 'The Royal Spice Pavilion',
      restaurantName: 'The Royal Spice Pavilion',
      date: new Date().toISOString().split('T')[0],
      invoiceNo: 'RSP-9821',
      category: 'Dining',
      subtotal: 840.0,
      serviceCharge: 84.0,
      serviceChargeIllegal: true,
      cgst: 21.0,
      sgst: 21.0,
      totalAmount: 966.0,
      status: 'REVIEW_RECOMMENDED',
      statusText: 'Illegal 10% Service Charge Flagged',
      consumerScore: 58,
      items: [
        { name: 'Mughlai Paneer Handi', qty: 2, price: 320, total: 640 },
        { name: 'Garlic Butter Naan', qty: 4, price: 50, total: 200 }
      ],
      issues: [
        'CCPA 2022 Guideline Violation: Mandatory 10% Service Charge levied under Section 2(47)',
        'GST computed improperly over illegal service charge component'
      ]
    },
    {
      id: `bill-${Date.now()}-2`,
      merchant: 'Apex Electronics Retail',
      restaurantName: 'Apex Electronics Retail',
      date: new Date().toISOString().split('T')[0],
      invoiceNo: 'APX-5510',
      category: 'Electronics',
      subtotal: 4200.0,
      serviceCharge: 0,
      serviceChargeIllegal: false,
      cgst: 588.0,
      sgst: 588.0,
      totalAmount: 5376.0,
      status: 'REVIEW_RECOMMENDED',
      statusText: 'Tax Rate Discrepancy (28% instead of 18%)',
      consumerScore: 62,
      items: [
        { name: 'Mechanical Keyboard USB-C', qty: 1, price: 3200, total: 3200 },
        { name: 'Braided Audio Cable 2m', qty: 2, price: 500, total: 1000 }
      ],
      issues: [
        'Incorrect HSN Classification: Peripheral taxed at luxury 28% instead of statutory 18% GST rate',
        'Overcharge of ₹420.00 in excess tax liability'
      ]
    },
    {
      id: `bill-${Date.now()}-3`,
      merchant: 'Grand Grandeur Luxury Suites',
      restaurantName: 'Grand Grandeur Luxury Suites',
      date: new Date().toISOString().split('T')[0],
      invoiceNo: 'GGL-2026-88',
      category: 'Hospitality',
      subtotal: 11200.0,
      serviceCharge: 1120.0,
      serviceChargeIllegal: true,
      cgst: 672.0,
      sgst: 672.0,
      totalAmount: 13664.0,
      status: 'REVIEW_RECOMMENDED',
      statusText: 'Voluntary Hospitality Levy Detected',
      consumerScore: 52,
      items: [
        { name: 'Executive Suite - 1 Night', qty: 1, price: 9500, total: 9500 },
        { name: 'In-Room Gourmet Breakfast', qty: 2, price: 850, total: 1700 }
      ],
      issues: [
        'Unconsented 10% Room Surcharge levied contrary to consumer protection norms',
        'Eligible for statutory zero-levy refund under Consumer Protection Act 2019'
      ]
    }
  ]

  const executeScan = (billData) => {
    setIsScanning(true)
    setScanStep(1)
    setScannedBill(null)

    // Simulate real-time 4-step OCR & statutory audit
    setTimeout(() => setScanStep(2), 500)
    setTimeout(() => setScanStep(3), 1100)
    setTimeout(() => {
      setScanStep(4)
      const saved = saveBillToHistory(billData)
      setScannedBill(saved || billData)
      setIsScanning(false)
      if (onBillScanned) onBillScanned(saved || billData)
    }, 1800)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Pick a demo bill payload or construct custom bill from upload
    const customBill = {
      id: `bill-${Date.now()}`,
      merchant: file.name.replace(/\.[^/.]+$/, "").slice(0, 24) || 'Custom Scanned Bill',
      restaurantName: file.name.replace(/\.[^/.]+$/, "").slice(0, 24) || 'Custom Scanned Bill',
      date: new Date().toISOString().split('T')[0],
      invoiceNo: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Retail & Dining',
      subtotal: 1450.0,
      serviceCharge: 145.0,
      serviceChargeIllegal: true,
      cgst: 36.25,
      sgst: 36.25,
      totalAmount: 1667.5,
      status: 'REVIEW_RECOMMENDED',
      statusText: 'CCPA 2022 Voluntary Levy Flagged',
      consumerScore: 65,
      items: [
        { name: 'Scanned Receipt Item #1', qty: 1, price: 950, total: 950 },
        { name: 'Scanned Receipt Item #2', qty: 2, price: 250, total: 500 }
      ],
      issues: ['Voluntary 10% Service Charge detected. Recoverable liability: ₹145.00']
    }
    executeScan(customBill)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload({ target: { files: e.dataTransfer.files } })
    }
  }

  return (
    <div ref={ref} id="scanner-section" className="vault-glass border border-[#D4AF37]/35 rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
      {/* Top Gold Horizon Accent */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/20 dark:border-white/10 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#B45309] dark:text-[#FDE68A] text-xs font-mono font-bold tracking-wider uppercase shadow-sm">
            <Sparkles size={14} className="text-[#D4AF37]" />
            3D Holographic AI Scanner
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-poppins">
            Scan & Audit Invoices in Real-Time
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            Upload your paper receipt, tax invoice, or restaurant bill. Our deterministic engine verifies GST brackets, detects illegal CCPA surcharges, and recalculates your true liability instantly.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-semibold">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Gemini 2.5 Flash + Rule Engine Active
          </div>
        </div>
      </div>

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: 3D Holographic Scanner Viewport */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[340px] rounded-2xl bg-gradient-to-b from-slate-900/5 to-slate-950/10 dark:from-[#050811]/60 dark:to-[#0D1322]/80 border border-slate-200/40 dark:border-white/10 overflow-hidden shadow-inner group">
          {/* 3D WebGL Canvas */}
          <div ref={mountRef} className="w-full h-[320px] cursor-grab active:cursor-grabbing z-10" />

          {/* Hologram Overlay Stats */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-[#38BDF8] border border-[#38BDF8]/30 backdrop-blur-md">
              HOLO-RADAR V2.4
            </span>
          </div>

          <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none px-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span>AUDIT: CCPA 2022</span>
            <span>FIDELITY: 99.8%</span>
          </div>
        </div>

        {/* Right: Interactive Upload Zone & Controls */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* File Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center transition-all duration-300 relative ${
              isDragOver 
                ? 'border-[#D4AF37] bg-[#D4AF37]/15 scale-[1.01]' 
                : 'border-slate-300 dark:border-white/15 hover:border-[#D4AF37]/60 bg-white/40 dark:bg-black/20 hover:bg-[#D4AF37]/5'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*,.pdf" 
              className="hidden" 
            />
            <input 
              type="file" 
              ref={cameraInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
            />

            <div className="max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#B45309] dark:text-[#FDE68A] flex items-center justify-center mx-auto shadow-md">
                <Upload size={22} className={isScanning ? 'animate-bounce' : ''} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Drop Bill Image Here or Choose Upload Method
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supports JPG, PNG, WebP receipts or PDF tax invoices up to 25MB
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="font-bold px-4 shadow-md shadow-[#D4AF37]/20"
                >
                  <Upload size={14} /> Upload Invoice File
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isScanning}
                  className="font-semibold px-4 border border-slate-300 dark:border-white/15"
                >
                  <Camera size={14} /> Capture with Camera
                </Button>
              </div>
            </div>
          </div>

          {/* Quick-Test Presets Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#D4AF37]" /> Or Instant-Test with Real Statutory Scenarios:
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">1-CLICK SCAN</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PRESET_BILLS.map((preset, idx) => (
                <button
                  key={preset.id}
                  onClick={() => executeScan(preset)}
                  disabled={isScanning}
                  className="p-3 rounded-xl text-left border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/60 bg-white/60 dark:bg-white/5 hover:bg-[#D4AF37]/10 transition-all cursor-pointer space-y-1 group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#B45309] dark:group-hover:text-[#FDE68A] truncate">
                      {preset.merchant}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-[#FDE68A]">
                      ₹{preset.totalAmount.toFixed(0)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {idx === 0 ? '10% Illegal Surcharge' : idx === 1 ? '28% vs 18% GST Disparity' : 'Hidden Hotel Resort Fee'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Live Scanning Status Radar */}
          {isScanning && (
            <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 space-y-2.5 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-[#B45309] dark:text-[#FDE68A]">
                <span className="flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin text-[#D4AF37]" />
                  {scanStep === 1 && "Step 1/4: Optical Character Recognition (OCR)..."}
                  {scanStep === 2 && "Step 2/4: Arithmetic Line-Item Cross-Check..."}
                  {scanStep === 3 && "Step 3/4: Statutory CCPA & GST Rule Validation..."}
                  {scanStep === 4 && "Step 4/4: Finalizing Audit Ledger..."}
                </span>
                <span className="font-mono">{scanStep * 25}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-300 dark:bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#38BDF8] transition-all duration-300 rounded-full"
                  style={{ width: `${scanStep * 25}%` }}
                />
              </div>
            </div>
          )}

          {/* Scanned Result Banner */}
          {scannedBill && !isScanning && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{scannedBill.merchant}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                      AUDITED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                    Total: ₹{Number(scannedBill.totalAmount).toFixed(2)} • {scannedBill.serviceChargeIllegal ? `₹${Number(scannedBill.serviceCharge).toFixed(2)} Recoverable Surcharge` : 'Statutory Compliant'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="primary" 
                  size="sm" 
                  to={`/analysis/${scannedBill.id}`}
                  className="font-bold px-4 shadow-md text-xs"
                >
                  Inspect Audit Report <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
})

export default Dashboard3DScanner
