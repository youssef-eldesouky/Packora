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
    <aside className="w-[300px] shrink-0 bg-[#161b27] border-r border-[#252d3f] flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[#252d3f]">
        {['product', 'layers'].map(tab => (
          <button
            key={tab}
            onClick={() => setLeftTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-all capitalize
              ${leftTab === tab
                ? 'text-white border-b-2 border-brand-500 bg-[#1e2535]'
                : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1e2535]/50'
              }`}
          >
            {tab === 'product' ? 'Product Settings' : 'Layers'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {leftTab === 'product' ? (
          <div className="p-4 space-y-5 panel-enter">
            {/* Box Type */}
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
                Box Type
              </label>
              <select
                value={boxType}
                onChange={e => setBoxType(e.target.value)}
                className="w-full bg-[#252d3f] border border-[#3c4a68] rounded-lg px-3 py-2.5 text-sm text-white
                  focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition-all"
              >
                {BOX_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
                Dimensions (inches)
              </label>
              <div className="space-y-2">
                {['length', 'width', 'height'].map(dim => (
                  <div key={dim} className="flex items-center gap-2">
                    <span className="text-xs text-[#64748b] w-14 capitalize">{dim}</span>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        min={1}
                        max={72}
                        step={0.5}
                        value={boxDimensions[dim]}
                        onChange={e => setBoxDimensions({ [dim]: parseFloat(e.target.value) || 1 })}
                        className="w-full bg-[#252d3f] border border-[#3c4a68] rounded-md px-3 py-2 text-sm text-white
                          focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition-all"
                      />
                    </div>
                    <span className="text-xs text-[#64748b]">in</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D preview dimensions display */}
            <div className="bg-[#1e2535] rounded-lg p-3 border border-[#252d3f]">
              <div className="text-xs text-[#64748b] mb-1.5 font-medium">Box Preview Size</div>
              <div className="flex justify-between text-xs text-[#94a3b8]">
                <span>L: <span className="text-white font-medium">{boxDimensions.length}"</span></span>
                <span>W: <span className="text-white font-medium">{boxDimensions.width}"</span></span>
                <span>H: <span className="text-white font-medium">{boxDimensions.height}"</span></span>
              </div>
              <div className="text-xs text-[#64748b] mt-1.5">
                Volume: <span className="text-white">{(boxDimensions.length * boxDimensions.width * boxDimensions.height).toFixed(1)} in³</span>
              </div>
            </div>

            {/* Material */}
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
                Material
              </label>
              <div className="space-y-2">
                {MATERIALS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMaterial(m.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all
                      ${material === m.value
                        ? 'border-brand-500 bg-brand-500/10 text-white'
                        : 'border-[#252d3f] bg-[#1e2535] text-[#94a3b8] hover:border-[#3c4a68] hover:text-white'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                      ${material === m.value ? 'border-brand-500' : 'border-[#3c4a68]'}`}>
                      {material === m.value && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{m.label}</div>
                      <div className="text-xs text-[#64748b]">{m.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Quantity
                </label>
                <span className="text-sm font-semibold text-white">{quantity.toLocaleString()} units</span>
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
              <div className="flex justify-between text-xs text-[#64748b] mt-1">
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
                    className={`text-center py-1.5 rounded-md text-xs font-medium border transition-all
                      ${quantity >= tier.qty
                        ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                        : 'bg-[#1e2535] border-[#252d3f] text-[#64748b] hover:border-[#3c4a68]'
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
