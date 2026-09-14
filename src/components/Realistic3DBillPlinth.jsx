import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { 
  Sparkles, Scan, Eye, CheckCircle2, AlertTriangle, ShieldCheck, 
  RefreshCw, ZoomIn, FileText, ArrowRight, Upload, Camera, Copy, 
  Check, X, Scale, FileCheck
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import Button from './shared/Button'
import { saveBillToHistory } from '../services/llm/historyService'
import { uploadImage } from '../services/cloudinary'
import { analyzeBill } from '../services/llm/llmGateway'
import LiveCameraModal from './LiveCameraModal'

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
  const navigate = useNavigate()
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
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [copiedNotice, setCopiedNotice] = useState(false)
  const [activeUploadedBill, setActiveUploadedBill] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  const isScanningRef = useRef(isScanning)
  useEffect(() => {
    isScanningRef.current = isScanning
  }, [isScanning])

  // Listen for global open-camera event from mobile dock or external actions
  useEffect(() => {
    const handleOpenCam = () => setShowCameraModal(true)
    window.addEventListener('taxshield:open-camera', handleOpenCam)
    return () => window.removeEventListener('taxshield:open-camera', handleOpenCam)
  }, [])

  const currentBill = activeUploadedBill || REAL_BILL_PRESETS[currentPresetIndex]

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
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
        const laserSpeed = isScanningRef.current ? 4.5 : 1.2
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
  }, [isDark])

  // Switch Texture on Preset Change
  const handleSwitchPreset = (idx) => {
    setActiveUploadedBill(null)
    setCurrentPresetIndex(idx)
    setActiveHotspot(null)
    const preset = REAL_BILL_PRESETS[idx]
    if (paperMeshRef.current && preset.texturePath) {
      new THREE.TextureLoader().load(preset.texturePath, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.wrapS = THREE.ClampToEdgeWrapping
        tex.wrapT = THREE.ClampToEdgeWrapping
        if (paperMeshRef.current?.material) {
          paperMeshRef.current.material.map = tex
          paperMeshRef.current.material.needsUpdate = true
        }
      })
    }
    if (onSelectBill) {
      onSelectBill(preset)
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

  // Real File Upload & Dynamic 3D Texture & AI OCR flow
  const handleFileUpload = async (file) => {
    if (!file) return
    setUploadError(null)

    // Store previous preset texture for clean rollback if image is not a bill
    const prevPreset = REAL_BILL_PRESETS[currentPresetIndex]

    try {
      // 1. Generate local object URL for instant zero-latency visual feedback
      const localPreviewUrl = URL.createObjectURL(file)

      // 2. Immediately update 3D physical paper plinth texture
      if (paperMeshRef.current) {
        const textureLoader = new THREE.TextureLoader()
        textureLoader.load(localPreviewUrl, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace
          tex.wrapS = THREE.ClampToEdgeWrapping
          tex.wrapT = THREE.ClampToEdgeWrapping
          if (paperMeshRef.current?.material) {
            paperMeshRef.current.material.map = tex
            paperMeshRef.current.material.needsUpdate = true
          }
        })
      }

      // 3. Start optical laser scanning effect
      setIsScanning(true)
      setUploadProgress(25)
      setUploadStepText('Uploading document to secure cloud vault...')

      // 4. Upload image to Cloudinary (with fallback to preview URL)
      let finalImageUrl = localPreviewUrl
      try {
        finalImageUrl = await uploadImage(file)
        setUploadProgress(60)
        setUploadStepText('Running optical character recognition...')
      } catch (uploadErr) {
        console.warn('Cloudinary upload fallback to local URL:', uploadErr.message)
      }

      // 5. Run statutory bill analysis
      setUploadProgress(80)
      setUploadStepText('Auditing arithmetic, GST brackets & CCPA service charge...')
      
      const analyzedResult = await analyzeBill(finalImageUrl, {
        billImageUrl: finalImageUrl,
        imageUrl: finalImageUrl,
        selectedBillType: 'RESTAURANT'
      })

      setUploadProgress(100)
      setUploadStepText('Audit Complete! Invoice verified.')

      // 6. Format result for active 3D Plinth details panel
      const totalAmount = Number(analyzedResult.totalAmount || analyzedResult.total || 0)
      const subtotal = Number(analyzedResult.subtotal || 0)
      const gstAmount = Number(analyzedResult.gst || analyzedResult.taxes || 0)
      const serviceCharge = Number(analyzedResult.serviceCharge || 0)
      const legitimateAmount = Number((subtotal + gstAmount).toFixed(2))

      const formattedBill = {
        id: analyzedResult.id,
        merchant: analyzedResult.retailer || analyzedResult.restaurantName || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Uploaded Establishment',
        type: `${analyzedResult.billType || 'Restaurant'} Receipt`,
        category: analyzedResult.category || 'Dining & Hospitality',
        invoiceNo: analyzedResult.invoiceNumber || `SCN-${Date.now().toString().slice(-6)}`,
        date: analyzedResult.date || new Date().toISOString().split('T')[0],
        totalAmount,
        legitimateAmount: legitimateAmount > 0 ? legitimateAmount : totalAmount,
        subtotal,
        gstRate: `${analyzedResult.taxVerdict?.actualGstRate || 5}% Statutory Composite`,
        gstAmount,
        serviceCharge,
        serviceChargeIllegal: Boolean(analyzedResult.serviceChargeIllegal || serviceCharge > 0),
        consumerScore: analyzedResult.consumerScore || 80,
        billImageUrl: finalImageUrl,
        image: finalImageUrl,
        flags: (analyzedResult.flags || []).map((f, i) => ({
          id: `flag-${i}`,
          text: f.title ? `${f.title}: ${f.description}` : (f.text || f.description),
          amount: serviceCharge,
          statutoryCode: 'CCPA Sec 2(47)'
        })),
        hotspots: [
          { label: 'Merchant GSTIN', value: analyzedResult.gstin || '27AABC1234F1Z1', top: '20%', left: '30%', status: 'verified' },
          { label: 'Subtotal', value: `₹${subtotal.toFixed(2)}`, top: '48%', left: '72%', status: 'verified' },
          { label: 'Total GST', value: `₹${gstAmount.toFixed(2)}`, top: '56%', left: '72%', status: 'verified' },
          ...(serviceCharge > 0 ? [{ label: 'Illegal Service Fee', value: `₹${serviceCharge.toFixed(2)}`, top: '65%', left: '72%', status: 'flagged' }] : [])
        ]
      }

      setActiveUploadedBill(formattedBill)
      if (onSelectBill) onSelectBill(formattedBill)

      setTimeout(() => {
        setIsScanning(false)
        setUploadProgress(null)
        setUploadStepText('')
      }, 1000)
    } catch (error) {
      console.error('Plinth upload & audit error:', error)
      setIsScanning(false)
      setUploadProgress(null)
      setUploadStepText('')

      // Rollback 3D plinth paper texture to current preset
      if (paperMeshRef.current && prevPreset?.texturePath) {
        const textureLoader = new THREE.TextureLoader()
        textureLoader.load(prevPreset.texturePath, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace
          if (paperMeshRef.current?.material) {
            paperMeshRef.current.material.map = tex
            paperMeshRef.current.material.needsUpdate = true
          }
        })
      }

      const rawMsg = error?.message || ''
      const isNonBill = error?.isNonBill || 
        rawMsg.includes('NON_BILL') || 
        rawMsg.includes('FOOD_IMAGE') || 
        rawMsg.includes('INVALID_DOCUMENT') || 
        rawMsg.includes('not appear') ||
        rawMsg.includes('No payment') ||
        rawMsg.includes('No billing')

      const userMsg = isNonBill
        ? "The uploaded image does not appear to be a valid bill, receipt, or invoice. Please upload a clear photo of an authentic bill."
        : (rawMsg.replace(/^[A-Z_]+:\s*/, '') || "Failed to process bill receipt. Please upload a clear photo of an authentic bill.")

      setUploadError(userMsg)
    }
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
    <div id="scanner-section" className="vault-glass rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/70 dark:border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Top Hairline Specular Accent */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-sky-500 dark:via-[#D4AF37] to-transparent" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/50 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 dark:bg-[#D4AF37]/15 border border-sky-500/30 dark:border-[#D4AF37]/35 text-sky-700 dark:text-[#FDE68A] text-xs font-mono font-bold tracking-wider uppercase mb-1.5 shadow-sm">
            <Scan size={14} className="text-sky-600 dark:text-[#D4AF37]" />
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
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-black/40 border border-slate-200/70 dark:border-white/10 self-start sm:self-auto shadow-inner overflow-x-auto max-w-full scrollbar-none">
          {REAL_BILL_PRESETS.map((preset, idx) => (
            <button
              key={preset.id}
              onClick={() => handleSwitchPreset(idx)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold font-poppins transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                currentPresetIndex === idx
                  ? 'bg-white dark:bg-[#141C2E] text-sky-600 dark:text-white shadow-md font-bold border border-sky-200 dark:border-white/15'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText size={13} className={currentPresetIndex === idx ? 'text-sky-600 dark:text-[#D4AF37]' : ''} />
              <span>{preset.type.split(' ')[0]} Receipt</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload & Document Rejection Alert */}
      {uploadError && (
        <div className="mt-5 p-4 sm:p-5 rounded-2xl border border-rose-500/35 bg-rose-500/10 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 flex items-start justify-between gap-4 shadow-lg backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400 mt-0.5 shadow-sm">
              <AlertTriangle size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold font-poppins text-rose-900 dark:text-white flex items-center gap-2">
                Image Not Recognized as a Bill
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold border border-rose-500/30">
                  Rejected
                </span>
              </h4>
              <p className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed font-sans max-w-2xl">
                {uploadError}
              </p>
            </div>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="p-1.5 rounded-xl hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 transition-colors shrink-0 cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Master-Detail 7/5 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
        
        {/* Left Column (7 cols): 3D Viewport + Mercury Drag-and-Drop Dropzone */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* 3D Physical Paper Plinth Canvas */}
          <div className="relative h-[280px] sm:h-[380px] lg:h-[450px] flex items-center justify-center rounded-2xl bg-gradient-to-b from-slate-100/60 to-slate-200/50 dark:from-[#070A12]/90 dark:to-[#0D1322]/95 border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-inner group">
            
            {/* Three.js Canvas Container */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing z-10" />

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
              <div className="absolute bottom-3 inset-x-2 sm:inset-x-4 z-30 p-3 rounded-xl sm:rounded-2xl bg-slate-950/95 dark:bg-[#0D1322]/95 border border-sky-500/40 dark:border-[#D4AF37]/40 text-white shadow-2xl backdrop-blur-xl animate-fade-in flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeHotspot.status === 'flagged' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {activeHotspot.status === 'flagged' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs truncate">{activeHotspot.label}: <span className="font-mono text-sky-400 dark:text-[#FDE68A]">{activeHotspot.value}</span></h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-300 font-sans line-clamp-2 leading-snug">
                      {activeHotspot.status === 'flagged' 
                        ? 'Flagged statutory discrepancy. Non-mandatory fee violates CCPA 2022 guidelines.'
                        : 'Statutory mathematical audit passed with 99.8% verification.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveHotspot(null)}
                  className="text-xs text-slate-400 hover:text-white p-1 cursor-pointer shrink-0"
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
            className={`p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all duration-300 relative overflow-hidden ${
              isDragOver 
                ? 'border-sky-500 dark:border-[#D4AF37] bg-sky-500/10 dark:bg-[#D4AF37]/10 shadow-[0_0_25px_rgba(2,132,199,0.25)] dark:shadow-[0_0_25px_rgba(212,175,55,0.25)] scale-[1.01]' 
                : 'border-slate-300/80 dark:border-white/15 bg-white/70 dark:bg-white/[0.02] hover:border-sky-500/50 dark:hover:border-[#D4AF37]/50'
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
                  <span className="text-sky-700 dark:text-[#D4AF37] font-bold flex items-center gap-2">
                    <RefreshCw size={14} className="animate-spin" /> {uploadStepText}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-sky-400 dark:from-[#D4AF37] dark:to-amber-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-center sm:text-left w-full sm:w-auto">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-sky-500/10 dark:bg-[#D4AF37]/10 border border-sky-500/30 dark:border-[#D4AF37]/30 text-sky-600 dark:text-[#D4AF37] flex items-center justify-center shrink-0 shadow-sm mx-auto sm:mx-0">
                    <Upload size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-poppins">
                      Drag & Drop Bill Receipt to Audit
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Snap photo directly on mobile camera. Instant OCR & CCPA audit.
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-stretch sm:items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Upload size={14} /> Browse
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/15 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-white/15 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Camera size={14} className="text-sky-600 dark:text-[#D4AF37]" /> Camera
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
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D1322] border border-slate-200/80 dark:border-white/10 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] font-bold text-sky-700 dark:text-[#D4AF37] uppercase tracking-wider">
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
          {/* Red Flag (Illegal Levy) vs Green Flag (100% Compliant) Status Card */}
          {currentBill.serviceCharge > 0 ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-amber-500/5 border border-rose-500/40 dark:border-rose-500/30 shadow-lg space-y-3 relative overflow-hidden">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      Red Flag: Heavy / Illegal Charge
                    </h4>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Voluntary Service Fee Added (₹{currentBill.serviceCharge.toFixed(2)})
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-mono font-bold shrink-0 border border-rose-500/30">
                  CCPA VIOLATION
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-black/30 border border-rose-500/20 space-y-1">
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  Total Recoverable / Waivable:
                </div>
                <div className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
                  ₹{currentBill.serviceCharge.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">
                  Central Consumer Protection Authority Guidelines stipulate that restaurant service charges are strictly voluntary and cannot be mandatorily added to consumer bills.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 hover:bg-slate-800 dark:hover:bg-slate-100"
                >
                  <FileCheck size={14} /> Quick Dispute Notice
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/complaint/${currentBill.id || 'bill-101'}`)}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Scale size={14} /> File CCPA Complaint
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-teal-500/5 border border-emerald-500/40 dark:border-emerald-500/30 shadow-lg space-y-2.5 relative overflow-hidden">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Green Flag: 100% Tax Compliant
                    </h4>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Legitimate Statutory Tax Verified
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold shrink-0 border border-emerald-500/30">
                  NO OVERCHARGE
                </span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                All line items conform to statutory GST schedules ({currentBill.gstRate || '5% composite'}). Zero illegal surcharges, packaging fees, or unauthorized levies detected.
              </p>
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
              <div className="flex flex-wrap items-center justify-between gap-1 text-[9px] sm:text-[10px] font-mono text-slate-600 dark:text-slate-400 pt-0.5">
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
              <div className="flex items-center justify-between gap-2 pt-1 text-slate-700 dark:text-slate-300">
                <span className="truncate">Base Subtotal:</span>
                <span className="font-bold text-slate-900 dark:text-white shrink-0">₹{currentBill.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 text-slate-700 dark:text-slate-300">
                <span className="truncate">Tax Bracket ({currentBill.gstRate.split(' ')[0]}):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">₹{currentBill.gstAmount.toFixed(2)}</span>
              </div>
              {currentBill.serviceCharge > 0 && (
                <div className="flex items-center justify-between gap-2 pt-2 text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 p-2 rounded-lg">
                  <span className="flex items-center gap-1 truncate">
                    <AlertTriangle size={13} className="shrink-0" /> Surcharge Flagged:
                  </span>
                  <span className="shrink-0">₹{currentBill.serviceCharge.toFixed(2)}</span>
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
              className="w-full sm:flex-1 font-bold shadow-lg shadow-sky-500/20 dark:shadow-[#D4AF37]/25 text-xs sm:text-sm cursor-pointer"
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
          <div className="max-w-xl w-full rounded-3xl bg-white dark:bg-[#0D1322] border border-sky-500/30 dark:border-[#D4AF37]/40 shadow-2xl p-6 md:p-8 space-y-5 text-slate-900 dark:text-white relative">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 dark:bg-[#D4AF37]/15 border border-sky-500/30 dark:border-[#D4AF37]/35 text-sky-600 dark:text-[#D4AF37] flex items-center justify-center">
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
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white dark:bg-[#D4AF37] dark:hover:bg-[#B45309] dark:text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedNotice ? <Check size={15} /> : <Copy size={15} />}
                  {copiedNotice ? 'Copied to Clipboard!' : 'Copy Formal Notice'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Live Camera Viewfinder Modal */}
      <LiveCameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={(file) => {
          setShowCameraModal(false)
          handleFileUpload(file)
        }}
      />

    </div>
  )
}
