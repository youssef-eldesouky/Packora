import React from 'react'
import { useStore } from '../store/useStore'
import LayersPanel from './LayersPanel'

const BOX_TYPES = [
  { value: 'mailer', label: 'Mailer Box' },
  { value: 'shipper', label: 'Shipping Box' },
  { value: 'giftbox', label: 'Gift Box' },
  { value: 'tray', label: 'Product Tray' },
]

const MATERIALS = [
  { value: 'kraft', label: 'Kraft', description: 'Natural brown, eco-friendly' },
  { value: 'white', label: 'White Clay', description: 'Bright white surface' },
  { value: 'premium', label: 'Premium Matte', description: 'Matte soft-touch finish' },
  { value: 'glossy', label: 'Glossy', description: 'High-shine finish' },
]

export default function LeftSidebar() {
  const {
    leftTab, setLeftTab,
    boxType, setBoxType,
    boxDimensions, setBoxDimensions,
    material, setMaterial,
    quantity, setQuantity,
  } = useStore()

  return (
    <aside className="glass-panel sidebar-panel flex h-full min-h-0 w-[320px] shrink-0 flex-col overflow-hidden">
      <div className="border-b border-border px-4 pb-4 pt-4">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">Configuration</p>
          <h2 className="mt-2 font-['Space_Grotesk'] text-xl font-bold text-foreground">Build Your Box</h2>
          <p className="mt-1 text-sm text-muted-foreground">Dial in structure, material, and run size before refining the artwork.</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Volume', value: `${(boxDimensions.length * boxDimensions.width * boxDimensions.height).toFixed(1)} in³` },
            { label: 'Material', value: MATERIALS.find(item => item.value === material)?.label ?? material },
            { label: 'Qty', value: quantity.toLocaleString() },
          ].map(item => (
            <div key={item.label} className="rounded-2xl border border-border bg-card/40 px-3 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{item.label}</div>
              <div className="mt-2 text-sm font-semibold text-foreground">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex border-b border-border px-2 pt-2">
        {['product', 'layers'].map(tab => (
          <button
            key={tab}
            onClick={() => setLeftTab(tab)}
            className={`flex-1 rounded-t-2xl px-3 py-3 text-sm font-medium transition-all capitalize
              ${leftTab === tab
                ? 'border border-b-0 border-border bg-card/80 text-foreground'
                : 'text-muted-foreground hover:bg-card/40 hover:text-foreground/80'
              }`}
          >
            {tab === 'product' ? 'Product Settings' : 'Layers'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {leftTab === 'product' ? (
          <div className="panel-enter space-y-5 p-4">
            {/* Box Type */}
            <div className="rounded-3xl border border-border bg-card/40 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Box Type
              </label>
              <select
                value={boxType}
                onChange={e => setBoxType(e.target.value)}
                className="w-full rounded-2xl border border-border bg-input-background px-3 py-3 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                {BOX_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Dimensions */}
            <div className="rounded-3xl border border-border bg-card/40 p-4">
              <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Dimensions (inches)
              </label>
              <div className="space-y-2">
                {['length', 'width', 'height'].map(dim => (
                  <div key={dim} className="flex items-center gap-2 rounded-2xl border border-border/50 bg-input-background px-3 py-2.5">
                    <span className="w-14 text-xs capitalize text-muted-foreground">{dim}</span>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        min={1}
                        max={72}
                        step={0.5}
                        value={boxDimensions[dim]}
                        onChange={e => setBoxDimensions({ [dim]: parseFloat(e.target.value) || 1 })}
                        className="w-full border-0 bg-transparent px-0 py-0 text-sm text-foreground focus:outline-none"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">in</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D preview dimensions display */}
            <div className="rounded-3xl border border-[#7db0ff22] bg-[linear-gradient(180deg,rgba(109,146,255,0.18),rgba(15,17,23,0.2))] p-4">
              <div className="mb-1.5 text-xs font-medium text-foreground/90">Box Preview Size</div>
              <div className="flex justify-between text-xs text-foreground/80">
                <span>L: <span className="text-foreground font-medium">{boxDimensions.length}"</span></span>
                <span>W: <span className="text-foreground font-medium">{boxDimensions.width}"</span></span>
                <span>H: <span className="text-foreground font-medium">{boxDimensions.height}"</span></span>
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                Volume: <span className="text-foreground">{(boxDimensions.length * boxDimensions.width * boxDimensions.height).toFixed(1)} in³</span>
              </div>
            </div>

            {/* Material */}
            <div className="rounded-3xl border border-border bg-card/40 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Material
              </label>
              <div className="space-y-2">
                {MATERIALS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMaterial(m.value)}
                    className={`w-full rounded-2xl border p-3 text-left transition-all
                      ${material === m.value
                        ? 'border-primary/60 bg-primary/12 text-foreground shadow-[0_12px_30px_rgba(53,99,250,0.12)]'
                        : 'border-border bg-input-background text-foreground/80 hover:border-border/80 hover:text-foreground'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2
                        ${material === m.value ? 'border-primary' : 'border-border'}`}>
                        {material === m.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{m.label}</div>
                        <div className="text-xs text-muted-foreground">{m.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="rounded-3xl border border-border bg-card/40 p-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Quantity
                </label>
                <span className="text-sm font-semibold text-foreground">{quantity.toLocaleString()} units</span>
              </div>
              <input
                type="range"
                min={50}
                max={10000}
                step={50}
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>50</span>
                <span>2,500</span>
                <span>10,000</span>
              </div>

              {/* Discount tiers */}
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {[
                  { qty: 100, disc: '5%' },
                  { qty: 500, disc: '15%' },
                  { qty: 1000, disc: '25%' },
                  { qty: 2500, disc: '35%' },
                  { qty: 5000, disc: '45%' },
                ].map(tier => (
                  <button
                    key={tier.qty}
                    onClick={() => setQuantity(tier.qty)}
                    className={`rounded-xl border py-1.5 text-center text-xs font-medium transition-all
                      ${quantity >= tier.qty
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-input-background border-border text-muted-foreground hover:border-border/80'
                      }`}
                  >
                    <div>{tier.qty >= 1000 ? `${tier.qty/1000}k` : tier.qty}</div>
                    <div className="text-[10px] opacity-70">-{tier.disc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <LayersPanel />
        )}
      </div>
    </aside>
  )
}
