import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

export const OUTER_FACES = ['front', 'back', 'left', 'right', 'top', 'bottom']
export const INNER_FACES = ['inside_front', 'inside_back', 'inside_left', 'inside_right', 'inside_bottom', 'inside_top']
export const ALL_FACES = [...OUTER_FACES, ...INNER_FACES]

export function isInnerFace(face) {
  return face.startsWith('inside_')
}

export function toInnerFace(face) {
  return `inside_${face}`
}

export function toOuterFace(face) {
  return face.replace('inside_', '')
}

export function faceLabelText(face) {
  if (isInnerFace(face)) {
    const outer = toOuterFace(face)
    return `Inside ${outer.charAt(0).toUpperCase() + outer.slice(1)}`
  }
  return face.charAt(0).toUpperCase() + face.slice(1)
}

const INNER_DEFAULT_BG = '#d4a66a'

function defaultFaceDesign(inner = false) {
  return { backgroundColor: inner ? INNER_DEFAULT_BG : '#ffffff', elements: [] }
}

function defaultDesigns() {
  const d = {}
  OUTER_FACES.forEach(f => { d[f] = defaultFaceDesign(false) })
  INNER_FACES.forEach(f => { d[f] = defaultFaceDesign(true) })
  return d
}

function defaultTextures() {
  const t = {}
  ALL_FACES.forEach(f => { t[f] = '' })
  return t
}

const MATERIAL_COST = {
  kraft: 0, white: 5, premium: 15, glossy: 25,
}

function calculatePriceUtil(dims, material, quantity, designs) {
  const basePrice = 2.5
  const volume = dims.length * dims.width * dims.height
  const sizeAdd = volume * 0.0008
  const materialCost = MATERIAL_COST[material]
  const totalElements = Object.values(designs).reduce((sum, f) => sum + f.elements.length, 0)
  const printCost = totalElements * 0.3

  let unitPrice = basePrice + sizeAdd + materialCost + printCost

  let discount = 0
  if (quantity >= 5000) discount = 0.45
  else if (quantity >= 2500) discount = 0.35
  else if (quantity >= 1000) discount = 0.25
  else if (quantity >= 500) discount = 0.15
  else if (quantity >= 250) discount = 0.1
  else if (quantity >= 100) discount = 0.05

  unitPrice = unitPrice * (1 - discount)
  return Math.max(0.5, Math.round(unitPrice * 100) / 100)
}

export const useStore = create((set, get) => ({
  selectedFace: 'front',
  boxType: 'mailer',
  boxDimensions: { length: 12, width: 8, height: 4 },
  material: 'kraft',
  quantity: 250,
  designs: defaultDesigns(),
  selectedElementId: null,
  leftTab: 'product',
  price: 2.5,
  history: [],
  historyIndex: -1,
  faceTextures: defaultTextures(),
  viewMode: '3d',
  isBoxOpen: false,
  cameraTarget: null,

  setSelectedFace: (face) => set({ selectedFace: face, selectedElementId: null, cameraTarget: face }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleBoxOpen: () => set(s => ({ isBoxOpen: !s.isBoxOpen })),
  setCameraTarget: (face) => set({ cameraTarget: face }),

  setBoxType: (boxType) => { set({ boxType }); get().calculatePrice() },
  setBoxDimensions: (dims) => {
    set(s => ({ boxDimensions: { ...s.boxDimensions, ...dims } }))
    get().calculatePrice()
  },
  setMaterial: (material) => { set({ material }); get().calculatePrice() },
  setQuantity: (quantity) => { set({ quantity }); get().calculatePrice() },
  setLeftTab: (tab) => set({ leftTab: tab }),
  setSelectedElement: (id) => set({ selectedElementId: id }),
  setFaceTexture: (face, dataUrl) =>
    set(s => ({ faceTextures: { ...s.faceTextures, [face]: dataUrl } })),

  addTextElement: (face) => {
    const element = {
      id: uuidv4(), type: 'text', content: 'Your Text Here',
      x: 50, y: 50, width: 200, height: 40, rotation: 0,
      fontSize: 24, fontFamily: 'Inter', color: isInnerFace(face) ? '#5c3a1e' : '#000000',
      fontWeight: 'normal', textAlign: 'center', opacity: 1, visible: true, locked: false,
    }
    set(s => ({
      designs: {
        ...s.designs,
        [face]: { ...s.designs[face], elements: [...s.designs[face].elements, element] },
      },
      selectedElementId: element.id,
    }))
    get().saveHistory()
    get().calculatePrice()
  },

  addImageElement: (face, src) => {
    const element = {
      id: uuidv4(), type: 'image', content: src,
      x: 50, y: 50, width: 150, height: 150, rotation: 0,
      fontSize: 0, fontFamily: '', color: '', fontWeight: 'normal',
      textAlign: 'center', opacity: 1, visible: true, locked: false,
    }
    set(s => ({
      designs: {
        ...s.designs,
        [face]: { ...s.designs[face], elements: [...s.designs[face].elements, element] },
      },
      selectedElementId: element.id,
    }))
    get().saveHistory()
    get().calculatePrice()
  },

  updateElement: (face, id, updates) => {
    set(s => ({
      designs: {
        ...s.designs,
        [face]: {
          ...s.designs[face],
          elements: s.designs[face].elements.map(el => el.id === id ? { ...el, ...updates } : el),
        },
      },
    }))
    get().calculatePrice()
  },

  deleteElement: (face, id) => {
    set(s => ({
      designs: {
        ...s.designs,
        [face]: { ...s.designs[face], elements: s.designs[face].elements.filter(el => el.id !== id) },
      },
      selectedElementId: s.selectedElementId === id ? null : s.selectedElementId,
    }))
    get().saveHistory()
    get().calculatePrice()
  },

  toggleElementVisibility: (face, id) => {
    set(s => ({
      designs: {
        ...s.designs,
        [face]: {
          ...s.designs[face],
          elements: s.designs[face].elements.map(el => el.id === id ? { ...el, visible: !el.visible } : el),
        },
      },
    }))
  },

  reorderElements: (face, fromIndex, toIndex) => {
    set(s => {
      const elements = [...s.designs[face].elements]
      const [removed] = elements.splice(fromIndex, 1)
      elements.splice(toIndex, 0, removed)
      return { designs: { ...s.designs, [face]: { ...s.designs[face], elements } } }
    })
  },

  setFaceBackground: (face, color) => {
    set(s => ({ designs: { ...s.designs, [face]: { ...s.designs[face], backgroundColor: color } } }))
    get().saveHistory()
  },

  saveHistory: () => {
    const { designs, history, historyIndex } = get()
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ designs: JSON.parse(JSON.stringify(designs)) })
    set({ history: newHistory.slice(-50), historyIndex: newHistory.length - 1 })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    set({ designs: JSON.parse(JSON.stringify(history[newIndex].designs)), historyIndex: newIndex })
    get().calculatePrice()
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    set({ designs: JSON.parse(JSON.stringify(history[newIndex].designs)), historyIndex: newIndex })
    get().calculatePrice()
  },

  calculatePrice: () => {
    const { boxDimensions, material, quantity, designs } = get()
    set({ price: calculatePriceUtil(boxDimensions, material, quantity, designs) })
  },
}))
