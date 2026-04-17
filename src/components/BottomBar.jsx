import React from 'react'
import { useStore } from '../store/useStore'

const MATERIAL_LABELS = {
  kraft: 'Kraft',
  white: 'White Clay',
  premium: 'Premium Matte',
  glossy: 'Glossy',
}

export default function BottomBar() {
  const { price, quantity, boxDimensions, material, designs } = useStore()

  const totalElements = Object.values(designs).reduce((sum, face) => sum + face.elements.length, 0)
  const totalPrice = price * quantity

  return (
    <div className="h-[52px] flex items-center justify-between px-5 bg-[#161b27] border-t border-[#252d3f] shrink-0">
      {/* Details */}
      <div className="flex items-center gap-5 text-xs text-[#64748b]">
        <span>
          <span className="text-[#94a3b8]">Size:</span> {boxDimensions.length}" × {boxDimensions.width}" × {boxDimensions.height}"
        </span>
        <span className="hidden sm:inline">
          <span className="text-[#94a3b8]">Material:</span> {MATERIAL_LABELS[material]}
        </span>
        <span className="hidden md:inline">
          <span className="text-[#94a3b8]">Qty:</span> {quantity.toLocaleString()} units
        </span>
        {totalElements > 0 && (
          <span className="hidden md:inline">
            <span className="text-[#94a3b8]">Elements:</span> {totalElements} design items
          </span>
        )}
      </div>

      {/* Price */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-xs text-[#64748b]">Unit Price</div>
          <div className="text-sm font-bold text-white">${price.toFixed(2)}</div>
        </div>
        <div className="w-px h-8 bg-[#252d3f]" />
        <div className="text-right">
          <div className="text-xs text-[#64748b]">Total ({quantity.toLocaleString()} units)</div>
          <div className="text-lg font-bold text-white">
            ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold
          hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg shadow-brand-500/20">
          Get Quote
        </button>
      </div>
    </div>
  )
}
