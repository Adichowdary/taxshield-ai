import { useState, useEffect } from 'react'
import { Copy, Check, Download, Edit3, ShieldAlert, Sparkles, FileCheck, Scale, BookmarkCheck } from 'lucide-react'
import Button from './shared/Button'
import api from '../services/api'

export default function ComplaintGenerator({ bill }) {
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [disputeType, setDisputeType] = useState('SERVICE_CHARGE')

  const merchant = bill?.merchant || bill?.restaurantName || 'Establishment'
  const date = bill?.date || new Date().toISOString().split('T')[0]
  const invoice = bill?.invoiceNo || (bill?.gstin ? `#${bill.gstin.slice(0, 8)}` : 'TG-10482')
  const totalAmount = bill?.statedTotal || bill?.totalAmount || 0
  const serviceCharge = bill?.serviceCharge || 0
  const difference = Math.abs(bill?.verification?.difference || 0)

  // Auto-select most pressing dispute type if present
  useEffect(() => {
    if (bill?.verification?.status === 'discrepancy' && difference > 0) {
      setDisputeType('MATH_DISCREPANCY')
    } else if (bill?.serviceCharge > 0) {
      setDisputeType('SERVICE_CHARGE')
    } else if (bill?.issues?.some(i => i.type === 'TAX_DISCREPANCY')) {
      setDisputeType('GST_OVERCHARGE')
    }
  }, [bill, difference])

  const generateComplaintText = (type) => {
    const timestamp = new Date().toLocaleString()
    
    if (type === 'SERVICE_CHARGE') {
      return `FORMAL CONSUMER GRIEVANCE: UNLAWFUL MANDATORY SERVICE CHARGE

To,
The Manager / Grievance Officer, ${merchant}
cc: Central Consumer Protection Authority (CCPA) National Consumer Helpline

Subject: Formal Demand for Refund / Waiver of Illegal Service Charge on Bill #${invoice}

Dear Management,

1. TRANSACTION DETAILS:
   - Establishment: ${merchant}
   - Invoice / Bill Number: ${invoice}
   - Date of Transaction: ${date}
   - Total Amount Paid: ₹${Number(totalAmount).toFixed(2)}
   - Disputed Service Charge: ₹${Number(serviceCharge).toFixed(2)}

2. LEGAL BASIS & VIOLATION:
   According to the binding guidelines issued by the Central Consumer Protection Authority (CCPA) on July 4, 2022 under Section 18 of the Consumer Protection Act, 2019:
   (a) No hotel or restaurant shall add service charge automatically or by default in the food bill.
   (b) Service charge is strictly voluntary and at the discretion of the consumer.
   (c) Forcing payment of a service charge constitutes an "unfair trade practice" under Section 2(47) of the Consumer Protection Act, 2019.

3. RELIEF SOUGHT:
   - Immediate refund of ₹${Number(serviceCharge).toFixed(2)} to the original payment mode within 48 hours.
   - Issuance of a rectified invoice reflecting only actual line items and statutory 5% GST.

In the event this grievance is not resolved promptly, this matter will be escalated to the National Consumer Helpline (NCH / 1915) and filed before the District Consumer Disputes Redressal Commission (e-daakhil.nic.in).

Verified via TaxShield AI Consumer Protection Engine
Timestamp: ${timestamp}`
    }

    if (type === 'MATH_DISCREPANCY') {
      return `FORMAL CONSUMER GRIEVANCE: ARITHMETIC DISCREPANCY & UNEXPLAINED CHARGES

To,
The Management / Billing Desk, ${merchant}
cc: Consumer Disputes Redressal Commission

Subject: Demand for Rectification of Billing Calculation Error on Invoice #${invoice}

Dear Management,

1. TRANSACTION DETAILS:
   - Establishment: ${merchant}
   - Invoice Number: ${invoice}
   - Date: ${date}
   - Stated Total Charged: ₹${Number(totalAmount).toFixed(2)}
   - Mathematically Expected Total: ₹${Number(bill?.verification?.expectedTotal || totalAmount).toFixed(2)}
   - Discrepancy Amount: ₹${difference.toFixed(2)}

2. DETAILED AUDIT FINDINGS:
   Independent arithmetic audit of the line items, statutory taxes, and declared fees reveals that the sum of itemized items plus applicable GST equals ₹${Number(bill?.verification?.expectedTotal || totalAmount).toFixed(2)}, whereas the billed amount demanded was ₹${Number(totalAmount).toFixed(2)}.
   
   This unaccounted difference of ₹${difference.toFixed(2)} represents an overcharge / hidden fee without itemized disclosure, violating Section 2(47) of the Consumer Protection Act, 2019.

3. RELIEF SOUGHT:
   - Immediate refund of the unexplained overcharge amount: ₹${difference.toFixed(2)}.
   - Revised itemized invoice with verified mathematical accuracy.

Submitted via TaxShield AI Deterministic Audit Engine
Timestamp: ${timestamp}`
    }

    return `FORMAL CONSUMER GRIEVANCE: STATUTORY GST RATE OVERCHARGE

To,
The Commercial Tax Officer & Management, ${merchant}
cc: GST Grievance Portal (cbec-gst.gov.in)

Subject: Unlawful Tax Collection in Excess of Statutory 5% GST on Invoice #${invoice}

Dear Management,

1. TRANSACTION DETAILS:
   - Establishment: ${merchant}
   - Invoice Number: ${invoice}
   - Date: ${date}
   - GSTIN Printed: ${bill?.gstin || "Not Provided / Invalid"}

2. STATUTORY VIOLATION:
   Under GST Council Notification No. 46/2017 - Central Tax (Rate), standalone restaurant services are subject to a maximum GST rate of 5% (2.5% CGST + 2.5% SGST) without Input Tax Credit.
   
   The invoice issued levied tax in excess of the statutory 5% rate for standalone dining, amounting to an illegal tax collection under Section 76 of the CGST Act, 2017.

3. RELIEF SOUGHT:
   - Immediate credit/refund of excess tax collected.
   - Proof of deposit of collected tax with the GST portal.

Submitted via TaxShield AI
Timestamp: ${timestamp}`
  }

  const [complaintText, setComplaintText] = useState(() => generateComplaintText(disputeType))

  // Update text when dispute type changes
  const handleTypeChange = (newType) => {
    setDisputeType(newType)
    setComplaintText(generateComplaintText(newType))
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(complaintText)
      setCopied(true)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = complaintText
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy'); setCopied(true) } catch { setCopied(false) }
      ta.remove()
    }
    setTimeout(() => setCopied(false), 2500)
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([complaintText], { type: 'text/plain;charset=utf-8' })
    element.href = URL.createObjectURL(file)
    element.download = `TaxShield_Grievance_${merchant.replace(/[^a-zA-Z0-9]/g, '_')}_${disputeType}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleSaveComplaint = async () => {
    try {
      setSaving(true)
      await api.createComplaint({
        billId: bill?.id || bill?._id,
        restaurantName: merchant,
        complaintReason: disputeType,
        complaintDetails: complaintText,
        evidence: {
          invoice,
          date,
          totalAmount,
          serviceCharge,
          difference,
        },
        status: 'Generated',
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.warn('Failed to save complaint to MongoDB:', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="vault-glass border border-[#D4AF37]/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-rose-500/15 text-rose-300 text-xs font-bold px-3 py-0.5 rounded-full border border-rose-400/40 inline-flex items-center gap-1">
              <ShieldAlert size={13} /> CCPA / Consumer Forum Assistant
            </span>
            <span className="bg-[#D4AF37]/15 text-[#FDE68A] text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/30 inline-flex items-center gap-1">
              <Scale size={12} /> CPA 2019 Cited
            </span>
          </div>
          <h3 className="font-poppins font-bold text-xl text-white tracking-tight">
            Legal Consumer Dispute Draft Generator
          </h3>
          <p className="text-xs font-sans mt-0.5 text-slate-400">
            Statutory notice drafted with precise legal clauses for restaurant management, NCH 1915, and National Consumer Forum.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="border-white/20 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
          >
            <Edit3 size={14} /> {isEditing ? 'Save Edit' : 'Edit Text'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            className="border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#FDE68A] hover:bg-[#D4AF37]/20"
          >
            {copied ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
            {copied ? 'Copied to Clipboard!' : 'Copy Notice'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveComplaint}
            disabled={saving}
            className="border-white/20 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
          >
            {saved ? <Check size={14} className="text-[#10B981]" /> : <BookmarkCheck size={14} />}
            {saving ? 'Saving...' : saved ? 'Saved to DB!' : 'Save Grievance'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            className="shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            <Download size={14} /> Download Notice (.txt)
          </Button>
        </div>
      </div>

      {/* Dispute Type Selector Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={() => handleTypeChange('SERVICE_CHARGE')}
          aria-pressed={disputeType === 'SERVICE_CHARGE'}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none ${
            disputeType === 'SERVICE_CHARGE'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#FDE68A] text-slate-950 shadow-md font-bold'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:border-[#D4AF37]/40 hover:text-white'
          }`}
        >
          <FileCheck size={13} /> Mandatory Service Charge (CCPA 2022)
        </button>
        <button
          onClick={() => handleTypeChange('MATH_DISCREPANCY')}
          aria-pressed={disputeType === 'MATH_DISCREPANCY'}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none ${
            disputeType === 'MATH_DISCREPANCY'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#FDE68A] text-slate-950 shadow-md font-bold'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:border-[#D4AF37]/40 hover:text-white'
          }`}
        >
          <Scale size={13} /> Total Calculation Error / Hidden Charge
        </button>
        <button
          onClick={() => handleTypeChange('GST_OVERCHARGE')}
          aria-pressed={disputeType === 'GST_OVERCHARGE'}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none ${
            disputeType === 'GST_OVERCHARGE'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#FDE68A] text-slate-950 shadow-md font-bold'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:border-[#D4AF37]/40 hover:text-white'
          }`}
        >
          <Sparkles size={13} /> GST Rate Overcharge (5% Cap)
        </button>
      </div>

      {/* Editor / Text Preview */}
      {isEditing ? (
        <textarea
          value={complaintText}
          onChange={(e) => setComplaintText(e.target.value)}
          rows={16}
          className="w-full font-mono text-xs p-4 rounded-2xl bg-slate-950/80 border border-white/20 text-slate-100 focus:outline-none focus:border-[#D4AF37] leading-relaxed"
        />
      ) : (
        <div className="bg-[#050811]/90 border border-white/10 rounded-2xl p-6 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap shadow-inner overflow-x-auto max-h-[420px] overflow-y-auto">
          {complaintText}
        </div>
      )}

      {/* Action Guidance */}
      <div className="border border-[#D4AF37]/30 bg-[#D4AF37]/5 rounded-2xl p-5 text-xs space-y-1.5 text-slate-300">
        <p className="font-bold text-[#D4AF37] flex items-center gap-1.5">
          <ShieldAlert size={14} /> Recommended Submission Channels:
        </p>
        <p className="leading-relaxed">
          1. <strong>Direct Management:</strong> Present this drafted notice to the restaurant billing supervisor before payment.<br />
          2. <strong>National Consumer Helpline:</strong> Call <strong>1915</strong> or WhatsApp <strong>+91-8800001915</strong> with this notice.<br />
          3. <strong>Online Consumer Commission:</strong> Submit grievance at <span className="text-[#FDE68A] font-mono">consumerhelpline.gov.in</span> or <span className="text-[#FDE68A] font-mono">edaakhil.nic.in</span>.
        </p>
      </div>
    </div>
  )
}
