import { uploadImage } from "../services/cloudinary";
import { auth } from "../config/firebase";
import api from "../services/api";
import { useState, useRef } from 'react'
import { Upload, Camera, CheckCircle2, RotateCw, Trash2, ArrowRight, Cpu, Sparkles, AlertTriangle, Utensils, ShoppingCart, Shirt, Smartphone, Pill, X } from 'lucide-react'
import Button from './shared/Button'
import { MOCK_BILLS } from '../data/mockData'
import SwiggyFieldMappingCard from './SwiggyFieldMappingCard'

export const BILL_CATEGORIES = [
  { id: 'AUTO', label: 'Auto-Detect', icon: Sparkles },
  { id: 'RESTAURANT', label: 'Dining & Food', icon: Utensils },
  { id: 'GROCERY', label: 'Supermarkets', icon: ShoppingCart },
  { id: 'FASHION', label: 'Fashion & Zudio', icon: Shirt },
  { id: 'ELECTRONICS', label: 'Electronics', icon: Smartphone },
  { id: 'PHARMACY', label: 'Pharmacy & Meds', icon: Pill },
];

export default function BillUploader({ onStartScan }) {
  const [selectedCategory, setSelectedCategory] = useState('AUTO')
  const [fileList, setFileList] = useState([]) // Array of { file, previewUrl, name, rotation }
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showSwiggyGuide, setShowSwiggyGuide] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const processFiles = (files) => {
    if (!files || files.length === 0) return

    const newEntries = Array.from(files).map((file) => ({
      file,
      previewUrl: typeof file === 'string' ? file : URL.createObjectURL(file),
      name: file.name || 'Uploaded Bill Receipt',
      rotation: 0
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
      'ITEMS:'
    ]
    if (Array.isArray(b.items)) {
      b.items.forEach(it => {
        const hsnText = it.hsn ? ` (HSN ${it.hsn})` : ''
        const taxText = it.taxRate ? ` [GST ${it.taxRate}]` : ''
        lines.push(`${it.qty || 1}x ${it.name}${hsnText} @ ₹${Number(it.unitPrice || it.price || 0).toFixed(2)}${taxText} = ₹${Number(it.total || ((it.qty || 1) * (it.unitPrice || 0))).toFixed(2)}`)
      })
    }
    lines.push('')
    lines.push(`Subtotal: ₹${Number(b.subtotal || 0).toFixed(2)}`)
    if (b.discount) lines.push(`Discount: ₹${Number(b.discount || 0).toFixed(2)}`)
    if (b.deliveryFee) lines.push(`Delivery Partner Fee: ₹${Number(b.deliveryFee || 0).toFixed(2)}`)
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
        rawTextPayload: sampleToText(sampleBill)
      }
    ])
    setSelectedIndex(0)
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

  const [uploadError, setUploadError] = useState('')

  const handleAnalyze = async () => {
    if (fileList.length === 0) {
      setUploadError("Hmm — your shoebox is empty. Drop a bill photo above and we will take it from there.");
      return;
    }
    setUploadError('')

    try {
      setIsUploading(true);

      const activeItem = fileList[selectedIndex] || fileList[0];
      const scanOpts = { selectedBillType: selectedCategory !== 'AUTO' ? selectedCategory : undefined };
      if (activeItem?.rawTextPayload) {
        if (onStartScan) {
          onStartScan(activeItem.rawTextPayload, scanOpts);
        }
        return;
      }

      const uploadPromises = fileList.map(async (item) => {
        let imageUrl = item.previewUrl;
        try {
          if (item.file && typeof item.file !== 'string' && item.file.type) {
            imageUrl = await uploadImage(item.file);
            await api.createBill({
              userId: auth.currentUser?.uid || "guest",
              billImageUrl: imageUrl,
              imageUrl,
              billType: selectedCategory !== 'AUTO' ? selectedCategory : 'RESTAURANT',
              restaurantName: "Pending Batch AI Analysis",
              verificationStatus: "Uploaded",
              status: "Uploaded",
            }).catch((err) => console.log("MongoDB batch note:", err.message));
          }
        } catch (err) {
          console.log("Upload fallback to previewUrl:", err.message);
        }
        return imageUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      if (onStartScan) {
        onStartScan(uploadedUrls.length === 1 ? uploadedUrls[0] : uploadedUrls, scanOpts);
      }
    } catch (error) {
      console.error("Batch Analysis Error:", error);
      setUploadError("That upload tripped on our side — try one photo, or tap a sample below and we will show you how it reads.");
    } finally {
      setIsUploading(false);
    }
  };

  const activeItem = fileList[selectedIndex] || fileList[0];

  return (
    <div className="vision-pro-card p-6 md:p-8 space-y-6">
      
      {/* Category Pill Selector */}
      <div className="space-y-2.5 pb-2 border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold font-poppins uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles size={14} className="text-lime-400" /> Bill Type & Category
          </label>
          <span className="text-[11px] text-lime-400/90 font-medium hidden sm:inline">
            Applies retail GST slabs & legal checks
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {BILL_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-lime-400 text-slate-950 shadow-[0_0_15px_rgba(132,204,22,0.4)] scale-105 font-bold'
                    : 'vision-pro-pill text-slate-300 hover:text-white hover:border-lime-400/40'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-slate-950' : 'text-lime-400'} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hidden File Input supporting MULTIPLE files */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && processFiles(e.target.files)}
        accept="image/jpeg,image/png,application/pdf"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={(e) => e.target.files && processFiles(e.target.files)}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Receipt Guidance Notice */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs backdrop-blur-md">
        <AlertTriangle size={18} className="text-amber-400 shrink-0" />
        <div className="leading-relaxed">
          <strong className="text-amber-300">All Retail Receipts Supported:</strong> Upload offline & online bills: Supermarkets (D-Mart), Fashion (Zudio), Electronics (Croma), Pharmacy (Apollo), or Restaurants. Non-receipt object photos are rejected by the AI engine.
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-4 rounded-2xl border border-rose-500/35 bg-rose-500/10 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 flex items-start justify-between gap-3 shadow-lg backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h5 className="text-xs font-bold text-rose-900 dark:text-white">Upload Error</h5>
              <p className="text-xs leading-relaxed text-rose-800 dark:text-rose-200">{uploadError}</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setUploadError('')}
            className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload Drop Zone (when empty) */}
      {fileList.length === 0 ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all cursor-pointer ${
            isDragOver 
              ? 'border-lime-400 bg-lime-400/15 scale-[1.01] shadow-[0_0_30px_rgba(132,204,22,0.3)]' 
              : 'border-lime-400/40 hover:border-lime-400 bg-lime-400/5'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-2xl bg-lime-400/15 text-lime-400 flex items-center justify-center mx-auto mb-4 border border-lime-400/30 shadow-[0_0_20px_rgba(132,204,22,0.2)]">
            <Upload size={32} />
          </div>

          <h3 className="font-poppins font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
            Drop single or multiple bill receipts here
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Supports batch upload of JPG, PNG, or digital PDF bills at once
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" size="md" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}>
              <Upload size={16} /> Select Bill File(s)
            </Button>

            <Button 
              variant="outline" 
              size="md" 
              onClick={(e) => {
                e.stopPropagation()
                cameraInputRef.current?.click()
              }}
            >
              <Camera size={16} /> Use Camera
            </Button>
          </div>
        </div>
      ) : (
        /* Image Preview & Multi-Bill Thumbnail Bar */
        <div className="space-y-4 auth-stagger">
          
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-500/30">
            <div className="flex items-center gap-2">
              <span className="bg-lime-400 text-slate-950 font-extrabold px-3 py-0.5 rounded-full text-xs shadow-md">
                {fileList.length} {fileList.length === 1 ? 'Bill' : 'Bills'} Selected
              </span>
              <span className="text-xs font-semibold truncate max-w-[220px]" style={{ color: 'var(--text-primary)' }}>
                {activeItem?.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 text-xs font-semibold flex items-center gap-1 transition-colors border border-lime-400/30"
                title="Add more bills to batch"
              >
                <Upload size={14} /> Add More Bills
              </button>
              <button
                onClick={handleRotateCurrent}
                className="p-2 rounded-xl vision-pro-pill text-xs font-medium flex items-center gap-1 transition-colors hover:border-lime-400/40"
                style={{ color: 'var(--text-primary)' }}
                title="Rotate current image"
              >
                <RotateCw size={14} /> Rotate
              </button>
              <button
                onClick={() => handleRemoveItem(selectedIndex)}
                className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-medium flex items-center gap-1 transition-colors border border-rose-500/30"
                title="Remove current receipt"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>

          {/* Main Selected Image Viewer */}
          <div className="relative vision-pro-pill rounded-2xl overflow-hidden min-h-[280px] max-h-[400px] flex items-center justify-center p-4 border-lime-400/20">
            {activeItem && (
              <img
                src={activeItem.previewUrl}
                alt="Selected receipt preview"
                style={{ transform: `rotate(${activeItem.rotation}deg)` }}
                className="max-h-[360px] w-auto object-contain transition-transform duration-300 rounded-lg shadow-xl"
              />
            )}
          </div>

          {/* Multi-Bill Thumbnail Carousel (if > 1 bill) */}
          {fileList.length > 1 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                Batch Receipt Queue ({fileList.length}):
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {fileList.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      idx === selectedIndex ? 'border-lime-400 ring-2 ring-lime-400/40 scale-105 shadow-[0_0_15px_rgba(132,204,22,0.3)]' : 'border-slate-500/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.previewUrl}
                      alt={`Receipt ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-slate-950/80 text-lime-400 font-bold text-[9px] px-1 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          {uploadError && (
            <p role="alert" className="text-xs font-semibold text-rose-500 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3.5 py-2.5">{uploadError}</p>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={handleAnalyze}
            className="w-full py-4 text-base font-bold"
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <Cpu className="animate-spin" size={20} /> Processing Batch AI Engine ({fileList.length} Bills)...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={20} />
                {fileList.length > 1
                  ? `Analyze All ${fileList.length} Bills with AI Batch Engine`
                  : 'Analyze This Bill with AI'}
                <ArrowRight size={20} />
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Instructions & Guidelines */}
      <div className="vision-pro-pill p-4 text-xs space-y-3 border-lime-400/20">
        <div className="flex items-center justify-between">
          <h4 className="font-poppins font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <CheckCircle2 size={15} className="text-lime-400" /> High-Accuracy AI Instructions:
          </h4>
          <button
            type="button"
            onClick={() => setShowSwiggyGuide(!showSwiggyGuide)}
            className="text-[11px] text-lime-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Sparkles size={12} /> {showSwiggyGuide ? "Hide Swiggy Field Intelligence" : "View Swiggy Screenshot AI Rules"}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans" style={{ color: 'var(--text-muted)' }}>
          <span>✓ Select single or multiple receipts for batch processing</span>
          <span>✓ Ensure all text & totals are clearly visible</span>
          <span>✓ Keep bill layouts flat & straight</span>
          <span>✓ Supported by parallel GPU AI engine for 99%+ accuracy</span>
        </div>

        {showSwiggyGuide && (
          <div className="pt-3 animate-fade-in">
            <SwiggyFieldMappingCard />
          </div>
        )}
      </div>

      {/* Sample Bills */}
      <div className="pt-2">
        <span className="text-xs font-bold font-poppins uppercase tracking-wider block mb-3" style={{ color: 'var(--text-muted)' }}>
          Or try sample offline / online bill receipts:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {MOCK_BILLS.slice(0, 6).map((bill) => (
            <button
              key={bill.id}
              onClick={() => handleSampleSelect(bill)}
              className="vision-pro-pill p-3.5 text-left transition-all text-xs space-y-1.5 hover:border-lime-400/50 hover:bg-lime-400/5 cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold truncate text-sm" style={{ color: 'var(--text-primary)' }}>{bill.merchant || bill.retailer}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-lime-400 font-semibold uppercase tracking-wider">
                  {bill.category || bill.billType || 'Bill'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono font-bold text-lime-400">₹{bill.totalAmount.toFixed(2)}</div>
                <div className="text-[10px] text-emerald-400 font-semibold">{bill.statusText || 'Compliant'}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
