import React from 'react'
import { useStore } from '../../../store/useStore'

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
    <div className="glass-panel flex min-h-[88px] flex-wrap items-center justify-between gap-6 px-6 py-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-border/50">
      <div className="flex flex-wrap items-center gap-8">
        {[
          { label: 'Size', value: `${boxDimensions.length}" × ${boxDimensions.width}" × ${boxDimensions.height}"` },
          { label: 'Volume', value: `${volume} in³` },
          { label: 'Material', value: MATERIAL_LABELS[material] },
          { label: 'Design', value: `${totalElements} item${totalElements === 1 ? '' : 's'}` },
        ].map(item => (
          <div key={item.label} className="flex flex-col gap-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</div>
            <div className="text-sm font-bold text-foreground">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end gap-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unit Price</div>
          <div className="text-sm font-bold text-foreground">${price.toFixed(2)}</div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total ({quantity.toLocaleString()} units)</div>
          <div className="text-[18px] font-extrabold text-[var(--deep-teal)]">${totalPrice.toFixed(2)}</div>
        </div>

       
      </div>
    </div>
  )
}
