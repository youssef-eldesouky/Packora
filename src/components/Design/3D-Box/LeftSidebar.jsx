import React from 'react'
import { useStore } from '../../../store/useStore'
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

        <div className="grid grid-cols-3 gap-2 pt-2">
          {[
            { label: 'Volume', value: `${(boxDimensions.length * boxDimensions.width * boxDimensions.height).toFixed(1)} in³` },
            { label: 'Material', value: MATERIALS.find(item => item.value === material)?.label ?? material },
            { label: 'Qty', value: quantity.toLocaleString() },
          ].map(item => (
            <div key={item.label} className="px-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1">{item.label}</div>
              <div className="text-sm font-bold text-foreground">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 border-b border-border/40">
        <div className="flex p-1 bg-input-background rounded-xl border border-border/50">
          {['product', 'layers'].map(tab => (
            <button
              key={tab}
              onClick={() => setLeftTab(tab)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all capitalize
                ${leftTab === tab
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab === 'product' ? 'Product Settings' : 'Layers'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {leftTab === 'product' ? (
          <div className="panel-enter space-y-5 p-4">
            {/* Box Type */}
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wider uppercase text-foreground/80">
                Box Type
              </label>
              <div className="relative">
                <select
                  value={boxType}
                  onChange={e => setBoxType(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-white pl-10 pr-8 py-3 text-sm font-medium text-foreground shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  {BOX_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wider uppercase text-foreground/80">
                Dimensions (centimeter)
              </label>
              <div className="space-y-2">
                {['length', 'width', 'height'].map(dim => (
                  <div key={dim} className="flex items-center justify-between rounded-xl border border-border bg-white px-3 py-2.5 shadow-sm transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                    <span className="text-xs text-muted-foreground font-medium capitalize w-16">{dim}</span>
                    <input
                      type="number"
                      min={1}
                      max={72}
                      step={0.5}
                      value={boxDimensions[dim]}
                      onChange={e => setBoxDimensions({ [dim]: parseFloat(e.target.value) || 1 })}
                      className="w-16 bg-transparent text-sm font-bold text-foreground focus:outline-none text-right"
                    />
                    <span className="text-xs text-muted-foreground ml-2">cm</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Eco Badge */}
            <div className="flex items-center justify-between rounded-xl border border-[var(--deep-teal)]/20 bg-[linear-gradient(180deg,rgba(82,121,111,0.08),rgba(82,121,111,0.02))] p-3">
              <div className="flex items-center gap-3">
                <div className="text-[var(--deep-teal)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M12 8v4m0 4h.01"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Eco-friendly material</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">100% recyclable kraft stock</div>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground opacity-50">
                <path d="M9 18l6-6-6-6"/>
              </svg>
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
                min={10}
                max={10000}
                step={5}
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>10</span>
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
