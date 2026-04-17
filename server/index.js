import express from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json({ limit: '50mb' }))

// In-memory store
const designs = new Map()

// Get all designs
app.get('/api/designs', (req, res) => {
  const all = Array.from(designs.values())
  res.json({ designs: all, count: all.length })
})

// Save design
app.post('/api/designs', (req, res) => {
  const { designs: faceDesigns, boxDimensions, material, quantity } = req.body
  const id = randomUUID()
  const design = {
    id,
    designs: faceDesigns,
    boxDimensions,
    material,
    quantity,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  designs.set(id, design)
  res.json({ success: true, design })
})

// Get single design
app.get('/api/designs/:id', (req, res) => {
  const design = designs.get(req.params.id)
  if (!design) return res.status(404).json({ error: 'Design not found' })
  res.json({ design })
})

// Update design
app.put('/api/designs/:id', (req, res) => {
  const existing = designs.get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Design not found' })
  const updated = { ...existing, ...req.body, id: req.params.id, updatedAt: new Date().toISOString() }
  designs.set(req.params.id, updated)
  res.json({ success: true, design: updated })
})

// Delete design
app.delete('/api/designs/:id', (req, res) => {
  designs.delete(req.params.id)
  res.json({ success: true })
})

// Price calculation
app.post('/api/price', (req, res) => {
  const { length = 12, width = 8, height = 4, material = 'kraft', quantity = 250, elementCount = 0 } = req.body

  const basePrice = 2.5
  const sizeFactor = 0.0008
  const volume = length * width * height
  const sizeAdd = volume * sizeFactor

  const materialCosts = { kraft: 0, white: 5, premium: 15, glossy: 25 }
  const materialCost = materialCosts[material] || 0
  const printCost = elementCount * 0.3

  let unitPrice = basePrice + sizeAdd + materialCost + printCost

  let quantityDiscount = 0
  if (quantity >= 5000) quantityDiscount = 0.45
  else if (quantity >= 2500) quantityDiscount = 0.35
  else if (quantity >= 1000) quantityDiscount = 0.25
  else if (quantity >= 500) quantityDiscount = 0.15
  else if (quantity >= 250) quantityDiscount = 0.1
  else if (quantity >= 100) quantityDiscount = 0.05

  unitPrice = unitPrice * (1 - quantityDiscount)
  unitPrice = Math.max(0.5, Math.round(unitPrice * 100) / 100)

  res.json({
    unitPrice,
    totalPrice: Math.round(unitPrice * quantity * 100) / 100,
    quantityDiscount: Math.round(quantityDiscount * 100),
    breakdown: { basePrice, sizeAdd, materialCost, printCost, quantityDiscount: quantityDiscount * unitPrice },
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PackCraft API running on port ${PORT}`)
})
