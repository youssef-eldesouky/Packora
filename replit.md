# PackCraft — 3D Box Configurator

A professional-grade 3D packaging customization tool similar to Packlane. Users can configure, design, and preview custom boxes in real-time using an interactive 3D editor.

## Architecture

- **Frontend**: React 18 + Vite, TypeScript, React Three Fiber (Three.js), Zustand state management, Tailwind CSS
- **Backend**: Express.js (Node.js) on port 3001
- **3D Engine**: Three.js via React Three Fiber with per-face HTML canvas textures
- **State**: Zustand with undo/redo history (50 steps)

## Key Features

- Interactive 3D box viewer with 6 independently designed faces
- Per-face HTML canvas texture system (512×512 per face)
- Add text elements with full typography controls
- Upload and place images on any face
- Background color per face with color picker
- Dynamic pricing engine based on dimensions, material, quantity
- Layers panel for element management (show/hide, delete, reorder)
- Undo/redo (50 step history)
- Save designs to backend API
- Export 3D view as PNG

## Layout

1. **Top Navbar** (~60px): Logo, Undo, Redo, Save, Export, Checkout
2. **Left Sidebar** (300px): Product Settings (box type, dimensions, material, quantity) + Layers panel
3. **Center Canvas**: Interactive 3D box with OrbitControls (rotate, zoom)
4. **Right Sidebar** (300px): Design tools (add text/image, background color) + element properties
5. **Bottom Bar** (~52px): Live unit + total price display

## State Structure (Zustand)

- `selectedFace`: active face being edited
- `boxDimensions`: { length, width, height }
- `material`: kraft | white | premium | glossy
- `quantity`: 50–10,000 units
- `designs`: per-face { backgroundColor, elements[] }
- `price`: calculated unit price
- `history`: undo/redo stack

## Pricing Engine

- Base: $2.50/unit
- Size factor: volume × 0.0008
- Material premium: kraft=$0, white=$5, premium=$15, glossy=$25
- Print cost: $0.30 per design element
- Quantity discounts: 100+=5%, 500+=15%, 1000+=25%, 2500+=35%, 5000+=45%

## Advanced 3D Features (v2)

- **Open/Close Box Animation** — Top flap pivots around a hinge using `useFrame` lerp (0° closed → 135° open). Separate Three.js Group with animated rotation.
- **Smooth Camera Transitions** — Selecting a face lerps the camera to the optimal viewing angle. Positions stored per face; camera movement runs in `useFrame`.
- **Pointer Cursor** — `gl.domElement.style.cursor` changes to `pointer` on face hover.
- **Hover & Selection Emissive** — Per-face emissive color highlights in `useFrame` (selected = blue glow, hover = subtle tint).
- **2D Dieline View** — Cross-shaped flat layout: Top / Left-Front-Right-Back / Bottom. Each face shows its live texture.
- **2D ↔ 3D Sync** — Shared Zustand `selectedFace` state. Clicking a face in 2D selects it in 3D (and triggers camera movement). Clicking in 3D highlights the corresponding 2D cell.
- **View Toggle** — "3D View" / "2D Layout" buttons in the canvas top-left.
- **Raycasting** — React Three Fiber's built-in `onClick`/`onPointerMove` with `e.face?.materialIndex` for face identification.

## Running

- `npm run dev` — starts both frontend (port 5000) and backend (port 3001) concurrently
- Frontend proxies `/api` to backend

## Box Faces (Three.js material order)

Three.js BoxGeometry uses: [right, left, top, bottom, front, back]
