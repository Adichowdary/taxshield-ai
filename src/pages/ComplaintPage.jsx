import Navbar from '../components/Navbar'
import MobileNav from '../components/MobileNav'
import Footer from '../components/Footer'
import Container from '../components/shared/Container'
import AmbientBackground from '../components/shared/AmbientBackground'
import ComplaintGenerator from '../components/ComplaintGenerator'
import { MOCK_BILLS } from '../data/mockData'
import { getBillById } from '../services/llm/historyService'
import { useParams } from 'react-router-dom'

const DEFAULT_SAMPLE_BILL = {
  id: "bill-101",
  merchant: "The Grill House",
  category: "Restaurant",
  date: "2026-07-31",
  time: "20:45",
  invoiceNo: "TG-10482",
  address: "102 Connaught Place, New Delhi",
  gstin: "07AAAAA0000A1Z5",
  totalAmount: 1437.50,
  subtotal: 1250.00,
  taxes: 62.50,
  cgst: 31.25,
  sgst: 31.25,
  serviceCharge: 125.00,
  status: "REVIEW_RECOMMENDED",
  statusText: "Non-Mandatory Service Charge",
  confidenceScore: 87,
  items: [
    { id: 1, name: "Paneer Tikka Platter", qty: 1, unitPrice: 320.00, taxRate: "5%", total: 320.00, confidence: 99, status: "VERIFIED" }
  ],
  issues: [
    {
      id: "issue-1",
      type: "SERVICE_CHARGE",
      severity: "warning",
      title: "Non-Mandatory Service Charge Detected",
      amount: 125.00,
      percentage: "10%",
      description: "A 10% service charge of ₹125.00 was added. Under Central Consumer Protection Authority (CCPA) guidelines, service charges levied by hotels/restaurants are voluntary.",
      recommendation: "You may request restaurant staff to deduct the service charge from your bill before making payment."
    }
  ]
}

export default function ComplaintPage() {
  const { id } = useParams()
  const foundBill = getBillById(id) || MOCK_BILLS.find(b => b.id === id)
  const bill = foundBill ? {
    ...foundBill,
    merchant: foundBill.restaurantName || foundBill.merchant || "Establishment",
    taxes: foundBill.gst || foundBill.taxes || (foundBill.cgst + foundBill.sgst) || 0,
    issues: foundBill.issues || (foundBill.serviceCharge > 0 ? [{
      id: `issue-${id}`,
      type: "SERVICE_CHARGE",
      severity: "warning",
      title: "Non-Mandatory Service Charge Detected",
      amount: foundBill.serviceCharge,
      percentage: "10%",
      description: `A service charge of ₹${foundBill.serviceCharge} was added. Under CCPA rules, restaurant service charges are voluntary.`,
      recommendation: "You may request restaurant staff to deduct the service charge from your bill."
    }] : [])
  } : DEFAULT_SAMPLE_BILL

  return (
    <div className="min-h-screen vision-pro-bg vision-pro-grid bg-vignette relative overflow-hidden font-sans flex flex-col selection:bg-[#D4AF37] selection:text-slate-950">
      {/* Luxury Obsidian Ambient Lights */}
      <AmbientBackground />

      <Navbar />

      <main className="flex-1 pt-28 pb-20 relative z-10">
        <Container className="max-w-5xl space-y-6">
          <div className="auth-stagger" style={{ animationDelay: '80ms' }}>
            <h1 className="text-3xl font-poppins font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Consumer Complaint Assistant</h1>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
              Generate formal CCPA-aligned grievance drafts to address unlawful mandatory service charges or tax overcharges
            </p>
          </div>

          <div className="auth-stagger" style={{ animationDelay: '160ms' }}>
            <ComplaintGenerator bill={bill} />
          </div>
        </Container>
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}

