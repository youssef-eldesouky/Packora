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
  const volume = (boxDimensions.length * boxDimensions.width * boxDimensions.height).toFixed(1)

  return (
    <div className="glass-panel flex min-h-[88px] flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        {[
          { label: 'Size', value: `${boxDimensions.length}" × ${boxDimensions.width}" × ${boxDimensions.height}"` },
          { label: 'Volume', value: `${volume} in³` },
          { label: 'Material', value: MATERIAL_LABELS[material] },
          { label: 'Design', value: `${totalElements} item${totalElements === 1 ? '' : 's'}` },
        ].map(item => (
          <div key={item.label} className="rounded-2xl border border-border bg-card/40 px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{item.label}</div>
            <div className="mt-1 text-sm font-semibold text-foreground">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Unit Price</div>
          <div className="text-sm font-bold text-foreground">${price.toFixed(2)}</div>
        </div>
        <div className="h-10 w-px bg-card/80" />
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Total ({quantity.toLocaleString()} units)</div>
          <div className="bg-[linear-gradient(135deg,#ffffff_0%,#c3d2ff_52%,#7fa3ff_100%)] bg-clip-text text-lg font-bold text-transparent">
            ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <button className="rounded-2xl bg-[linear-gradient(135deg,#f5c55d_0%,#ff9e67_16%,#6d92ff_62%,#3563fa_100%)] px-5 py-3 text-sm font-semibold text-foreground shadow-[0_18px_45px_rgba(53,99,250,0.28)] transition-all hover:translate-y-[-1px]">
          Get Quote
        </button>
      </div>
    </div>
  )
}
