import { useState, useRef } from 'react'
import { 
  Upload, Camera, CheckCircle2, RotateCw, Trash2, ArrowRight, 
  Sparkles, AlertCircle, Utensils, ShoppingCart, Shirt, Smartphone, 
  Pill, X, FileText, Loader2
} from 'lucide-react'
import { uploadImage } from '../services/cloudinary'
import { auth } from '../config/firebase'
import api from '../services/api'
import Button from './shared/Button'
import { MOCK_BILLS } from '../data/mockData'
import SwiggyFieldMappingCard from './SwiggyFieldMappingCard'
import LiveCameraModal from './LiveCameraModal'

export const BILL_CATEGORIES = [
  { id: 'AUTO', label: 'Auto-Detect', icon: Sparkles },
  { id: 'RESTAURANT', label: 'Dining & Food', icon: Utensils },
  { id: 'GROCERY', label: 'Supermarkets', icon: ShoppingCart },
  { id: 'FASHION', label: 'Fashion & Retail', icon: Shirt },
  { id: 'ELECTRONICS', label: 'Electronics', icon: Smartphone },
  { id: 'PHARMACY', label: 'Pharmacy & Health', icon: Pill },
]

export default function BillUploader({ onStartScan }) {
  const [selectedCategory, setSelectedCategory] = useState('AUTO')
  const [fileList, setFileList] = useState([]) // Array of { file, previewUrl, name, rotation }
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [showSwiggyGuide, setShowSwiggyGuide] = useState(false)
  const [showCameraModal, setShowCameraModal] = useState(false)

  const fileInputRef = useRef(null)
  const nativeCameraInputRef = useRef(null)

  const processFiles = (files) => {
    if (!files || files.length === 0) return
    setUploadError('')

    const newEntries = Array.from(files).map((file) => ({
      file,
      previewUrl: typeof file === 'string' ? file : URL.createObjectURL(file),
      name: file.name || `Receipt_${new Date().toISOString().slice(0, 10)}.jpg`,
      rotation: 0,
    }))

    setFileList((prev) => [...prev, ...newEntries])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const sampleToText = (b) => {
    const lines = [
      `${b.merchant || b.retailer}`,
      `Category: ${b.category || b.billType || 'Retail'}`,
      `Invoice: ${b.invoiceNo || 'INV-2026-101'}`,
      `Date: ${b.date || new Date().toISOString().split('T')[0]}`,
      `GSTIN: ${b.gstin || '07AAAAA0000A1Z5'}`,
      '',
      'ITEMS:',
    ]
    if (Array.isArray(b.items)) {
      b.items.forEach((it) => {
        const hsnText = it.hsn ? ` (HSN ${it.hsn})` : ''
        const taxText = it.taxRate ? ` [GST ${it.taxRate}]` : ''
        lines.push(
          `${it.qty || 1}x ${it.name}${hsnText} @ ₹${Number(it.unitPrice || it.price || 0).toFixed(2)}${taxText} = ₹${Number(
            it.total || (it.qty || 1) * (it.unitPrice || 0)
          ).toFixed(2)}`
        )
      })
    }
    lines.push('')
    lines.push(`Subtotal: ₹${Number(b.subtotal || 0).toFixed(2)}`)
    if (b.discount) lines.push(`Discount: ₹${Number(b.discount || 0).toFixed(2)}`)
    if (b.deliveryFee) lines.push(`Delivery Fee: ₹${Number(b.deliveryFee || 0).toFixed(2)}`)
    if (b.packagingFee) lines.push(`Packaging Fee: ₹${Number(b.packagingFee || 0).toFixed(2)}`)
    if (b.platformFee) lines.push(`Platform Fee: ₹${Number(b.platformFee || 0).toFixed(2)}`)
    if (b.serviceCharge) lines.push(`Service Charge: ₹${Number(b.serviceCharge || 0).toFixed(2)}`)
    if (b.cgst) lines.push(`CGST: ₹${Number(b.cgst || 0).toFixed(2)}`)
    if (b.sgst) lines.push(`SGST: ₹${Number(b.sgst || 0).toFixed(2)}`)
    if (b.taxes && !b.cgst) lines.push(`Total GST: ₹${Number(b.taxes || 0).toFixed(2)}`)
    lines.push(`Total Amount: ₹${Number(b.totalAmount || b.total || 0).toFixed(2)}`)
    return lines.join('\n')
  }

  const handleSampleSelect = (sampleBill) => {
    if (sampleBill.billType) {
      setSelectedCategory(sampleBill.billType)
    }
    setFileList([
      {
        file: { name: `${sampleBill.merchant || sampleBill.retailer} Receipt.jpg` },
        previewUrl: sampleBill.image,
        name: `${sampleBill.merchant || sampleBill.retailer} Receipt`,
        rotation: 0,
        rawTextPayload: sampleToText(sampleBill),
      },
    ])
    setSelectedIndex(0)
    setUploadError('')
  }

  const handleRotateCurrent = () => {
    setFileList((prev) =>
      prev.map((item, idx) =>
        idx === selectedIndex ? { ...item, rotation: (item.rotation + 90) % 360 } : item
      )
    )
  }

  const handleRemoveItem = (indexToRemove) => {
    setFileList((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove)
      if (selectedIndex >= updated.length) {
        setSelectedIndex(Math.max(0, updated.length - 1))
      }
      return updated
    })
  }

  const handleAnalyze = async () => {
    if (fileList.length === 0) {
      setUploadError('Please select or capture a bill receipt to start analysis.')
      return
    }
    setUploadError('')

    try {
      setIsUploading(true)

      const activeItem = fileList[selectedIndex] || fileList[0]
      const scanOpts = { 
        selectedBillType: selectedCategory !== 'AUTO' ? selectedCategory : undefined,
        fileName: activeItem?.name,
        file: activeItem?.file
      }

      if (activeItem?.rawTextPayload) {
        if (onStartScan) {
          onStartScan(activeItem.rawTextPayload, scanOpts)
        }
        return
      }

      const uploadPromises = fileList.map(async (item) => {
        let imageUrl = item.previewUrl
        try {
          if (item.file && typeof item.file !== 'string' && item.file.type) {
            imageUrl = await uploadImage(item.file)
            await api.createBill({
              userId: auth.currentUser?.uid || 'guest',
              billImageUrl: imageUrl,
              imageUrl,
              billType: selectedCategory !== 'AUTO' ? selectedCategory : 'RESTAURANT',
              restaurantName: item.name.replace(/\.[^/.]+$/, ''),
              verificationStatus: 'Uploaded',
              status: 'Uploaded',
            }).catch((err) => console.warn('MongoDB note:', err.message))
          }
        } catch (err) {
          console.warn('Cloudinary upload fallback to preview URL:', err.message)
        }
        return imageUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)

      if (onStartScan) {
        onStartScan(uploadedUrls.length === 1 ? uploadedUrls[0] : uploadedUrls, scanOpts)
      }
    } catch (error) {
      console.error('Batch analysis error:', error)
      setUploadError('Could not process this receipt. Please try another photo or choose a sample below.')
    } finally {
      setIsUploading(false)
    }
  }

  // Direct scan when user captures a photo via camera on mobile or PC
  const handleCaptureAndScan = async (capturedFile) => {
    if (!capturedFile) return
    setUploadError('')
    setShowCameraModal(false)

    const item = {
      file: capturedFile,
      previewUrl: typeof capturedFile === 'string' ? capturedFile : URL.createObjectURL(capturedFile),
      name: capturedFile.name || `Camera_Receipt_${Date.now()}.jpg`,
      rotation: 0,
    }

    setFileList([item])
    setSelectedIndex(0)

    try {
      setIsUploading(true)
      const scanOpts = {
        selectedBillType: selectedCategory !== 'AUTO' ? selectedCategory : undefined,
        fileName: item.name,
        file: item.file,
      }

      let imageUrl = item.previewUrl
      try {
        if (capturedFile && typeof capturedFile !== 'string' && capturedFile.type) {
          imageUrl = await uploadImage(capturedFile)
          await api.createBill({
            userId: auth.currentUser?.uid || 'guest',
            billImageUrl: imageUrl,
            imageUrl,
            billType: selectedCategory !== 'AUTO' ? selectedCategory : 'RESTAURANT',
            restaurantName: item.name.replace(/\.[^/.]+$/, ''),
            verificationStatus: 'Uploaded',
            status: 'Uploaded',
          }).catch((err) => console.warn('MongoDB note:', err.message))
        }
      } catch (err) {
        console.warn('Cloudinary upload fallback to preview URL:', err.message)
      }

      if (onStartScan) {
        onStartScan(imageUrl, scanOpts)
      }
    } catch (error) {
      console.error('Camera direct scan error:', error)
      setUploadError('Failed to analyze captured photo. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const activeItem = fileList[selectedIndex] || fileList[0]

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Category Selector */}
      <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Bill category
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Applies statutory GST slabs & CCPA checks
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {BILL_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-white dark:text-slate-900' : 'text-slate-500'} />
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Hidden File & Camera Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files)
          }
          e.target.value = ''
        }}
        accept="image/*,application/pdf"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={nativeCameraInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleCaptureAndScan(e.target.files[0])
          }
          e.target.value = ''
        }}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* High-Contrast Guidance Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs">
        <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-amber-950 dark:text-amber-100">Supported receipts: </span>
          Dining & cafe bills, supermarket slips (D-Mart, Blinkit), retail & clothing (Zudio), electronics, or pharmacy. Ensure date, items, and totals are legible.
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{uploadError}</p>
          </div>
          <button
            type="button"
            onClick={() => setUploadError('')}
            className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 transition-colors"
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload Drop Zone (when empty) */}
      {fileList.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
            isDragOver
              ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-slate-50/50 dark:bg-slate-900/40'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700">
            <Upload size={24} />
          </div>

          <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white mb-1">
            Drop your bill receipt here
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            Upload photos (JPG, PNG, HEIC) or digital PDF invoices
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <Upload size={15} /> Select Bill File
            </button>

            {/* Direct Camera Scanner Trigger: Opens native high-res camera on mobile or Live Viewfinder on PC */}
            <button
              type="button"
              onClick={() => {
                const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
                if (isMobile && nativeCameraInputRef.current) {
                  nativeCameraInputRef.current.click()
                } else {
                  setShowCameraModal(true)
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <Camera size={15} /> Scan with Camera
            </button>

            {/* Live Web Viewfinder button for desktop/tablets */}
            <button
              type="button"
              onClick={() => setShowCameraModal(true)}
              className="hidden sm:inline-flex px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium text-xs transition-colors cursor-pointer items-center gap-1.5"
            >
              <Camera size={14} className="text-sky-600 dark:text-sky-400" /> Live Viewfinder
            </button>
          </div>
        </div>
      ) : (
        /* Image Preview & Batch Queue */
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-2.5 py-0.5 rounded-full text-xs">
                {fileList.length} {fileList.length === 1 ? 'Receipt' : 'Receipts'}
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[220px]">
                {activeItem?.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                title="Add more bills"
              >
                <Upload size={13} /> Add more
              </button>
              <button
                type="button"
                onClick={handleRotateCurrent}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                title="Rotate image"
              >
                <RotateCw size={13} /> Rotate
              </button>
              <button
                type="button"
                onClick={() => handleRemoveItem(selectedIndex)}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-1 transition-colors border border-rose-200 dark:border-rose-900/50"
                title="Remove receipt"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>

          {/* Main Selected Image Viewer */}
          <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 min-h-[260px] max-h-[380px] flex items-center justify-center p-4 border border-slate-200 dark:border-slate-800">
            {activeItem && (
              <img
                src={activeItem.previewUrl}
                alt="Selected receipt preview"
                style={{ transform: `rotate(${activeItem.rotation}deg)` }}
                className="max-h-[340px] w-auto object-contain transition-transform duration-300 rounded shadow-sm"
              />
            )}
          </div>

          {/* Multi-Bill Thumbnails */}
          {fileList.length > 1 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                Queue ({fileList.length}):
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {fileList.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      idx === selectedIndex
                        ? 'border-slate-900 dark:border-white ring-2 ring-slate-400/30'
                        : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.previewUrl}
                      alt={`Receipt ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white font-mono text-[9px] px-1 rounded">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isUploading}
            className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Processing Receipt Audit…
              </>
            ) : (
              <>
                <span>{fileList.length > 1 ? `Audit All ${fileList.length} Receipts` : 'Audit This Bill'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      )}

      {/* Instructions & Guidelines */}
      <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
            Tips for best accuracy
          </h4>
          <button
            type="button"
            onClick={() => setShowSwiggyGuide(!showSwiggyGuide)}
            className="text-xs text-sky-600 dark:text-sky-400 font-medium hover:underline cursor-pointer"
          >
            {showSwiggyGuide ? 'Hide delivery app guide' : 'Delivery app screenshot guide'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
          <span>• Ensure bill is flat and well-lit with all totals visible</span>
          <span>• Offline thermal paper receipts & PDF invoices supported</span>
          <span>• Checks GST rates against statutory Indian tax brackets</span>
          <span>• Highlights voluntary service fees per CCPA guidelines</span>
        </div>

        {showSwiggyGuide && (
          <div className="pt-3 animate-fade-in border-t border-slate-200 dark:border-slate-700 mt-2">
            <SwiggyFieldMappingCard />
          </div>
        )}
      </div>

      {/* Sample Bills */}
      <div className="pt-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2.5">
          Or try a sample offline / online receipt:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {MOCK_BILLS.slice(0, 6).map((bill) => (
            <button
              key={bill.id}
              type="button"
              onClick={() => handleSampleSelect(bill)}
              className="p-3 text-left transition-colors text-xs space-y-1 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {bill.merchant || bill.retailer}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                  {bill.category || bill.billType || 'Bill'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  ₹{bill.totalAmount.toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {bill.statusText || 'Compliant'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* In-App Camera Viewfinder Modal */}
      <LiveCameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={(capturedFile) => {
          handleCaptureAndScan(capturedFile)
        }}
      />
    </div>
  )
}
