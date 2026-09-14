import { useState } from 'react'
import { Search, Plus, Trash2, FileText, Check } from 'lucide-react'
import Button from './shared/Button'

export default function ItemizedTable({ items = [], onItemsChange }) {
  const [query, setQuery] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [isAdding, setIsAdding] = useState(false)

  // New Item State
  const [newItemName, setNewItemName] = useState('')
  const [newItemQty, setNewItemQty] = useState(1)
  const [newItemPrice, setNewItemPrice] = useState('')

  const handleAddItem = (e) => {
    e.preventDefault()
    if (!newItemName || !newItemPrice) return

    const price = parseFloat(newItemPrice) || 0
    const qty = parseInt(newItemQty) || 1

    const newItem = {
      id: Date.now(),
      name: newItemName,
      qty: qty,
      unitPrice: price,
      taxRate: "5%",
      total: price * qty,
      confidence: 99,
      status: "VERIFIED"
    }

    const updated = [...items, newItem]
    if (onItemsChange) onItemsChange(updated)

    setNewItemName('')
    setNewItemQty(1)
    setNewItemPrice('')
    setIsAdding(false)
  }

  const handleRemoveItem = (id) => {
    const updated = items.filter(item => item.id !== id)
    if (onItemsChange) onItemsChange(updated)
  }

  const filteredItems = items.filter(item => 
    (item.name || '').toLowerCase().includes(query.toLowerCase())
  )

  const sortedItems = [...filteredItems].sort((a, b) => {
    let valA = a[sortField] ?? ''
    let valB = b[sortField] ?? ''
    if (typeof valA === 'string') {
      valA = valA.toLowerCase()
      valB = valB.toLowerCase()
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1
    if (valA > valB) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  return (
    <div className="vision-pro-card p-6 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-500/30">
        <div>
          <h3 className="font-poppins font-bold text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FileText size={18} className="text-lime-400" /> Itemized Charges Breakdown
          </h3>
          <p className="text-xs font-sans mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Dynamic line item manager with real-time total & tax recalculation
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs vision-pro-pill auth-input-glow focus:outline-none font-sans border-lime-400/30"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <Button variant="outline" size="sm" onClick={() => setIsAdding(!isAdding)}>
            <Plus size={14} /> Add Item
          </Button>
        </div>
      </div>

      {/* Add New Line Item Inline Form */}
      {isAdding && (
        <form onSubmit={handleAddItem} className="p-4 vision-pro-pill border-lime-400/40 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs auth-stagger">
          <div>
            <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>Item Name</label>
            <input
              type="text"
              placeholder="e.g. Masala Dosa"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              required
              className="w-full p-2 vision-pro-pill border-lime-400/30 text-slate-100 focus:outline-none auth-input-glow"
            />
          </div>

          <div>
            <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>Quantity</label>
            <input
              type="number"
              min="1"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              required
              className="w-full p-2 vision-pro-pill border-lime-400/30 text-slate-100 focus:outline-none auth-input-glow"
            />
          </div>

          <div>
            <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>Unit Price (₹)</label>
            <input
              type="number"
              step="0.01"
              placeholder="150.00"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              required
              className="w-full p-2 vision-pro-pill border-lime-400/30 text-slate-100 focus:outline-none auth-input-glow"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button variant="primary" size="sm" type="submit" className="w-full">
              <Check size={14} /> Add Item
            </Button>
          </div>
        </form>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-500/30 text-[11px] font-poppins font-bold uppercase tracking-wider text-lime-400">
              <th className="py-3 px-4 cursor-pointer hover:underline" onClick={() => toggleSort('name')}>
                Item Description {sortField === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="py-3 px-4 text-center cursor-pointer hover:underline" onClick={() => toggleSort('qty')}>
                Qty
              </th>
              <th className="py-3 px-4 text-right cursor-pointer hover:underline" onClick={() => toggleSort('unitPrice')}>
                Unit Price
              </th>
              <th className="py-3 px-4 text-center">Tax Rate</th>
              <th className="py-3 px-4 text-right cursor-pointer hover:underline" onClick={() => toggleSort('total')}>
                Total
              </th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-500/20 text-xs font-sans">
            {sortedItems.map((item, idx) => {
              const uPrice = Number(item.unitPrice ?? item.price ?? 0)
              const totalVal = Number(item.total ?? (uPrice * (item.qty || 1)))
              const delayMs = Math.min(idx, 8) * 50
              return (
                <tr 
                  key={item.id} 
                  className="hover:bg-lime-400/5 transition-colors auth-stagger"
                  style={{ animationDelay: `${delayMs}ms` }}
                >
                  <td className="py-3.5 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name || 'Unnamed Item'}</td>
                  <td className="py-3.5 px-4 text-center font-mono" style={{ color: 'var(--text-muted)' }}>{item.qty || 1}</td>
                  <td className="py-3.5 px-4 text-right font-mono" style={{ color: 'var(--text-muted)' }}>₹{uPrice.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    <span className="bg-lime-400/15 border border-lime-400/30 text-lime-400 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {item.taxRate || '5%'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                    ₹{totalVal.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {sortedItems.map((item, idx) => {
          const uPrice = Number(item.unitPrice ?? item.price ?? 0)
          const totalVal = Number(item.total ?? (uPrice * (item.qty || 1)))
          const delayMs = Math.min(idx, 8) * 50
          return (
            <div 
              key={item.id} 
              className="p-4 vision-pro-pill border-lime-400/20 text-xs space-y-2 auth-stagger"
              style={{ animationDelay: `${delayMs}ms` }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.name || 'Unnamed Item'}</h4>
                  <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>Qty: {item.qty || 1} × ₹{uPrice.toFixed(2)}</p>
                </div>
                <span className="font-bold text-emerald-400 font-mono text-sm">₹{totalVal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-500/30 text-[11px]">
                <span className="font-mono" style={{ color: 'var(--text-muted)' }}>GST Rate: {item.taxRate || '5%'}</span>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-rose-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
