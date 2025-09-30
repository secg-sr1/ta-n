// // import { useState } from 'react'
// // import reactLogo from './assets/react.svg'
// // import viteLogo from '/vite.svg'
// // import './App.css'

// // function App() {
// //   const [count, setCount] = useState(0)

// //   return (
// //     <>
// //       <h1>Hello friend</h1>
// //     </>
// //   )
// // }

// // export default App

// // 3D Google Fonts World — React + Vite + @react-three/fiber + @react-three/drei
// // -----------------------------------------------------------------------------
// // What this does
// // - Builds a 3D world with 100 Google Font variations as floating tiles
// // - Uses drei Html to render CSS-styled font samples anchored in 3D
// // - OrbitControls, Stars, and subtle Float animation
// // - Search/filter by family, toggle layout (sphere / grid), export selection
// //
// // Setup
// //   npm create vite@latest fonts-3d -- --template react
// //   cd fonts-3d
// //   npm i three @react-three/fiber @react-three/drei zustand
// //   Replace src/App.jsx with this file OR mount this component from your App
// //   npm run dev
// //
// // IMPORTANT: We load Google Fonts by injecting multiple <link> tags (batched),
// // because a single CSS2 URL can hit length limits. Edit FONT_FAMILIES below to taste.

// import React, { useEffect, useMemo, useRef, useState } from 'react'
// import { Canvas } from '@react-three/fiber'
// import { OrbitControls, Html, Float, Stars, Environment, Text as DreiText } from '@react-three/drei'
// import * as THREE from 'three'
// import { create } from 'zustand'

// // ————————————————————————————————————————————————————————————————————————
// // 100 Google Font families (names must match Google Fonts CSS2 spec)
// // Keep them simple (no variant spec); we request 400 weight by default.
// // Feel free to swap any you don’t like.
// // ————————————————————————————————————————————————————————————————————————
// const FONT_FAMILIES = [
//   'Roboto','Open Sans','Lato','Montserrat','Poppins','Source Sans 3','Raleway','Inter','Nunito','Noto Serif',
//   'Merriweather','Playfair Display','Oswald','PT Sans','Fira Sans','Quicksand','Rubik','Work Sans','Maven Pro','Heebo',
//   'Mulish','Ubuntu','Titillium Web','Josefin Sans','Inconsolata','DM Sans','DM Serif Display','Overpass','Cabin','Exo 2',
//   'Libre Baskerville','Karla','Barlow','Barlow Condensed','Barlow Semi Condensed','Space Grotesk','Space Mono','Manrope','Saira','Hind',
//   'Archivo','Arimo','Asap','Varela Round','Zilla Slab','Righteous','Pacifico','Dancing Script','Great Vibes','Sacramento',
//   'Lobster Two','Courgette','Satisfy','Amatic SC','Indie Flower','Playball','Parisienne','Allura','Yellowtail','Shadows Into Light',
//   'Caveat','Cinzel','Cinzel Decorative','Abril Fatface','Anton','Bebas Neue','Alfa Slab One','Cormorant Garamond','Cormorant Infant','Cormorant',
//   'Lora','Bitter','Noto Sans','Noto Sans Display','Noto Serif Display','IBM Plex Sans','IBM Plex Serif','IBM Plex Mono','JetBrains Mono','Source Code Pro',
//   'Fira Code','PT Serif','Spectral','Merriweather Sans','Catamaran','Kumbh Sans','Jost','Urbanist','Outfit','Lexend',
//   'Mukta','Teko','Exo','Poiret One','Lobster','Cardo','Overlock','Philosopher','Signika','Signika Negative'
// ]

// // ————————————————————————————————————————————————————————————————————————
// // Utilities: load Google Fonts in batches (safe for long URL limits)
// // ————————————————————————————————————————————————————————————————————————
// function injectGoogleFontsBatched(families, batchSize = 14) {
//   // Build multiple <link> tags: https://fonts.googleapis.com/css2?family=Name:wght@400&display=swap
//   const head = document.head
//   // Remove previous injected links (by our data-attr)
//   document.querySelectorAll('link[data-gf-batch="true"]').forEach(n => n.remove())

//   for (let i = 0; i < families.length; i += batchSize) {
//     const chunk = families.slice(i, i + batchSize)
//     const params = chunk
//       .map(f => `family=${encodeURIComponent(f)}:wght@400`)
//       .join('&')
//     const href = `https://fonts.googleapis.com/css2?${params}&display=swap`
//     const link = document.createElement('link')
//     link.setAttribute('rel', 'stylesheet')
//     link.setAttribute('href', href)
//     link.setAttribute('data-gf-batch', 'true')
//     head.appendChild(link)
//   }
// }

// // ————————————————————————————————————————————————————————————————————————
// // Store (filter, layout, selection)
// // ————————————————————————————————————————————————————————————————————————
// const useStore = create((set) => ({
//   query: '',
//   layout: 'sphere', // 'sphere' | 'grid'
//   selected: new Set(),
//   toggleLayout: () => set((s) => ({ layout: s.layout === 'sphere' ? 'grid' : 'sphere' })),
//   setQuery: (q) => set({ query: q }),
//   toggleSelect: (name) => set((s) => {
//     const next = new Set(s.selected)
//     next.has(name) ? next.delete(name) : next.add(name)
//     return { selected: next }
//   })
// }))

// // ————————————————————————————————————————————————————————————————————————
// // Positions: arrange N points on a sphere or grid
// // ————————————————————————————————————————————————————————————————————————
// function pointsOnSphere(n, radius = 8) {
//   const pts = []
//   for (let i = 0; i < n; i++) {
//     const y = 1 - (i / (n - 1)) * 2
//     const r = Math.sqrt(1 - y * y)
//     const phi = Math.PI * (3 - Math.sqrt(5)) * i
//     pts.push(new THREE.Vector3(Math.cos(phi) * r * radius, y * radius, Math.sin(phi) * r * radius))
//   }
//   return pts
// }

// function pointsOnGrid(n, cols = 10, gap = 1.8) {
//   const rows = Math.ceil(n / cols)
//   const pts = []
//   const ox = -((cols - 1) * gap) / 2
//   const oy = -((rows - 1) * gap) / 2
//   for (let i = 0; i < n; i++) {
//     const c = i % cols
//     const r = Math.floor(i / cols)
//     pts.push(new THREE.Vector3(ox + c * gap, oy + r * gap, 0))
//   }
//   return pts
// }

// // ————————————————————————————————————————————————————————————————————————
// // FontTile: one floating card with Html sample in 3D
// // ————————————————————————————————————————————————————————————————————————
// function FontTile({ name, position, onClick, selected }) {
//   const sample = 'Nutriomics'
//   const color = selected ? '#00e676' : '#fafafa'
//   const bg = selected ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255,255,255,0.06)'
//   return (
//     <Float speed={1} rotationIntensity={0.25} floatIntensity={0.6}>
//       <group position={position}>
//         <Html
//           transform
//           distanceFactor={3.5}
//           occlude
//           style={{ pointerEvents: 'auto' }}
//          >
//           <div
//             onClick={onClick}
//             title={`Click to ${selected ? 'unselect' : 'select'}`}
//             style={{
//               width: 240,
//               padding: '14px 16px',
//               borderRadius: 12,
//               backdropFilter: 'blur(6px)',
//               background: bg,
//               border: selected ? '1px solid #00e676' : '1px solid rgba(255,255,255,0.12)',
//               boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
//               color,
//             }}
//           >
//             <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{name}</div>
//             <div style={{
//               fontFamily: `'${name}', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
//               fontSize: 28,
//               lineHeight: 1.1,
//               whiteSpace: 'nowrap',
//             }}>{sample}</div>
//             <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>Regular 400</div>
//           </div>
//         </Html>
//       </group>
//     </Float>
//   )
// }

// // ————————————————————————————————————————————————————————————————————————
// // HUD overlay (HTML UI)
// // ————————————————————————————————————————————————————————————————————————
// function Hud() {
//   const query = useStore((s) => s.query)
//   const layout = useStore((s) => s.layout)
//   const selected = useStore((s) => s.selected)
//   const setQuery = useStore((s) => s.setQuery)
//   const toggleLayout = useStore((s) => s.toggleLayout)

//   const exportSelection = () => {
//     const list = Array.from(selected)
//     const blob = new Blob([JSON.stringify({ fonts: list, count: list.length }, null, 2)], { type: 'application/json' })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = 'selected-fonts.json'
//     a.click()
//     URL.revokeObjectURL(url)
//   }

//   return (
//     <div style={{ position: 'fixed', top: 16, left: 16, right: 16, display:'flex', gap: 12, alignItems:'center' }}>
//       <input
//         value={query}
//         onChange={(e)=> useStore.getState().setQuery(e.target.value)}
//         placeholder="Search 100 fonts…"
//         style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background:'rgba(20,20,24,0.6)', color:'#fff' }}
//       />
//       <button onClick={toggleLayout} style={{ padding:'10px 12px', borderRadius: 10, border:'1px solid rgba(255,255,255,0.2)', background:'rgba(20,20,24,0.6)', color:'#fff' }}>
//         Layout: {layout === 'sphere' ? 'Sphere' : 'Grid'}
//       </button>
//       <button onClick={exportSelection} style={{ padding:'10px 12px', borderRadius: 10, border:'1px solid rgba(255,255,255,0.2)', background:'#00e676', color:'#001b12', fontWeight:700 }}>
//         Export ({selected.size})
//       </button>
//     </div>
//   )
// }

// // ————————————————————————————————————————————————————————————————————————
// // Scene
// // ————————————————————————————————————————————————————————————————————————
// function Scene() {
//   const query = useStore((s) => s.query)
//   const layout = useStore((s) => s.layout)
//   const selected = useStore((s) => s.selected)
//   const toggleSelect = useStore((s) => s.toggleSelect)

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase()
//     return q ? FONT_FAMILIES.filter(f => f.toLowerCase().includes(q)) : FONT_FAMILIES
//   }, [query])

//   const positions = useMemo(() => {
//     return layout === 'sphere' ? pointsOnSphere(filtered.length, 10) : pointsOnGrid(filtered.length, 10, 2)
//   }, [filtered.length, layout])

//   return (
//     <>
//       {/* Lighting & environment */}
//       <ambientLight intensity={0.6} />
//       <directionalLight position={[10, 10, 5]} intensity={0.6} />
//       <Stars radius={80} depth={50} count={4000} factor={2} saturation={0} fade speed={0.6} />
//       <Environment preset="city" />

//       {/* Tiles */}
//       {filtered.map((name, i) => (
//         <FontTile
//           key={name}
//           name={name}
//           position={positions[i]}
//           selected={selected.has(name)}
//           onClick={() => toggleSelect(name)}
//         />
//       ))}

//       <OrbitControls makeDefault enablePan enableRotate enableZoom zoomSpeed={0.6} />
//     </>
//   )
// }

// // ————————————————————————————————————————————————————————————————————————
// // App (mounts Canvas + HUD, injects Google Fonts)
// // ————————————————————————————————————————————————————————————————————————
// export default function App() {
//   // Inject CSS links for all families on mount
//   useEffect(() => {
//     injectGoogleFontsBatched(FONT_FAMILIES, 14)
//   }, [])

//   return (
//     <div style={{ width: '100vw', height: '100vh', background:'#0b0e13' }}>
//       <Canvas camera={{ position: [0, 0, 20], fov: 50 }} dpr={[1, 2]}>
//         <Scene />
//       </Canvas>
//       <Hud />
//     </div>
//   )
// }


// 3D Google Fonts World — React + Vite + @react-three/fiber + @react-three/drei
// COMPLETE SINGLE-FILE APP (drop into src/App.jsx)
// -----------------------------------------------------------------------------
// Features
// - 100 Google font families displayed as floating 3D tiles
// - Each tile shows YOUR reference image instead of a letter sample
// - Search box to filter fonts, toggle sphere/grid layouts
// - Click to select tiles and export selection as JSON
// - Stars, environment lighting, OrbitControls
//
// Quick start
//   npm create vite@latest fonts-3d -- --template react
//   cd fonts-3d
//   npm i three @react-three/fiber @react-three/drei zustand
//   Replace src/App.jsx with this file
//   Put your image at public/TA-LOGO-NUTRIOMICS-BIG.png (or use HUD > Change image)
//   npm run dev
//
// NOTE: Zustand v5 uses named import: `import { create } from 'zustand'`

// 3D Google Fonts World — React + Vite + @react-three/fiber + @react-three/drei
// COMPLETE SINGLE-FILE APP (src/App.jsx)
// -----------------------------------------------------------------------------
// Features
// - 100 Google font families displayed as floating 3D tiles
// - Each tile shows your image AND overlays the font sample text "omics" beside the image
// - Search box to filter fonts, toggle sphere/grid layouts
// - Click to select tiles and export selection as JSON
// - Stars, environment lighting, OrbitControls
//
// Setup
//   npm create vite@latest fonts-3d -- --template react
//   cd fonts-3d
//   npm i three @react-three/fiber @react-three/drei zustand
//   Replace src/App.jsx with this file
//   Put your image at public/TA-LOGO-NUTRIOMICS-BIG.png
//   npm run dev

import React, { useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html, Float, Stars, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { create } from 'zustand'


const EXTRA_CURSIVE_FONTS = [
  "Aguafina Script", "Alex Brush", "Alike Angular", "Almendra Display", "Almarai",
  "Bilbo", "Bilbo Swash Caps", "Bonbon", "Butterfly Kids", "Calligraffitti",
  "Cedarville Cursive", "Clicker Script", "Cookie", "Covered By Your Grace", "Dawning of a New Day",
  "Dynalight", "Eagle Lake", "Euphoria Script", "Felipa", "Fondamento",
  "Gloria Hallelujah", "Grand Hotel", "Great Vibes", "Handlee", "Herr Von Muellerhoff",
  "Homemade Apple", "Italianno", "Jim Nightshade", "Just Another Hand", "Kaushan Script",
  "Kristi", "La Belle Aurore", "League Script", "Long Cang", "Loved by the King",
  "Marck Script", "Meddon", "Merienda", "Montez", "Mrs Saint Delafield",
  "Neucha", "Norican", "Nothing You Could Do", "Over the Rainbow", "Patrick Hand",
  "Permanent Marker", "Qwigley", "Rochester", "Rock Salt", "Sriracha"
];

const FONT_FAMILIES = [
  'Roboto','Open Sans','Lato','Montserrat','Poppins','Source Sans 3','Raleway','Inter','Nunito','Noto Serif',
  'Merriweather','Playfair Display','Oswald','PT Sans','Fira Sans','Quicksand','Rubik','Work Sans','Maven Pro','Heebo',
  'Mulish','Ubuntu','Titillium Web','Josefin Sans','Inconsolata','DM Sans','DM Serif Display','Overpass','Cabin','Exo 2',
  'Libre Baskerville','Karla','Barlow','Barlow Condensed','Barlow Semi Condensed','Space Grotesk','Space Mono','Manrope','Saira','Hind',
  'Archivo','Arimo','Asap','Varela Round','Zilla Slab','Righteous','Pacifico','Dancing Script','Great Vibes','Sacramento',
  'Lobster Two','Courgette','Satisfy','Amatic SC','Indie Flower','Playball','Parisienne','Allura','Yellowtail','Shadows Into Light',
  'Caveat','Cinzel','Cinzel Decorative','Abril Fatface','Anton','Bebas Neue','Alfa Slab One','Cormorant Garamond','Cormorant Infant','Cormorant',
  'Lora','Bitter','Noto Sans','Noto Sans Display','Noto Serif Display','IBM Plex Sans','IBM Plex Serif','IBM Plex Mono','JetBrains Mono','Source Code Pro',
  'Fira Code','PT Serif','Spectral','Merriweather Sans','Catamaran','Kumbh Sans','Jost','Urbanist','Outfit','Lexend',
  'Mukta','Teko','Exo','Poiret One','Lobster','Cardo','Overlock','Philosopher','Signika','Signika Negative', ...EXTRA_CURSIVE_FONTS
]

const DEFAULT_IMG = '/TA-LOGO-NUTRIOMICS-BIG.png'

function injectGoogleFontsBatched(families, batchSize = 14) {
  document.querySelectorAll('link[data-gf-batch="true"]').forEach((n) => n.remove())
  for (let i = 0; i < families.length; i += batchSize) {
    const chunk = families.slice(i, i + batchSize)
    const params = chunk.map((f) => `family=${encodeURIComponent(f)}:wght@400`).join('&')
    const href = `https://fonts.googleapis.com/css2?${params}&display=swap`
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.setAttribute('data-gf-batch', 'true')
    document.head.appendChild(link)
  }
}

const useStore = create((set) => ({
  query: '',
  layout: 'sphere',
  selected: new Set(),
  imageUrl: DEFAULT_IMG,
  toggleLayout: () => set((s) => ({ layout: s.layout === 'sphere' ? 'grid' : 'sphere' })),
  setQuery: (q) => set({ query: q }),
  setImageUrl: (u) => set({ imageUrl: u || DEFAULT_IMG }),
  toggleSelect: (name) =>
    set((s) => {
      const next = new Set(s.selected)
      next.has(name) ? next.delete(name) : next.add(name)
      return { selected: next }
    }),
}))

function pointsOnSphere(n, radius = 10) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const phi = Math.PI * (3 - Math.sqrt(5)) * i
    pts.push(new THREE.Vector3(Math.cos(phi) * r * radius, y * radius, Math.sin(phi) * r * radius))
  }
  return pts
}

function pointsOnGrid(n, cols = 10, gap = 2) {
  const rows = Math.ceil(n / cols)
  const pts = []
  const ox = -((cols - 1) * gap) / 2
  const oy = -((rows - 1) * gap) / 2
  for (let i = 0; i < n; i++) {
    const c = i % cols
    const r = Math.floor(i / cols)
    pts.push(new THREE.Vector3(ox + c * gap, oy + r * gap, 0))
  }
  return pts
}

function FontTile({ name, position, onClick, selected }) {
  const imageUrl = useStore((s) => s.imageUrl)
  const color = selected ? '#00e676' : '#fafafa'
  const bg = selected ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255,255,255,0.06)'
  return (
    <Float speed={1} rotationIntensity={0.25} floatIntensity={0.6}>
      <group position={position}>
        <Html transform distanceFactor={3.5} occlude style={{ pointerEvents: 'auto' }}>
          <div
            onClick={onClick}
            title={`Click to ${selected ? 'unselect' : 'select'}`}
            style={{
              width: 260,
              padding: '12px',
              borderRadius: 12,
              backdropFilter: 'blur(6px)',
              background: bg,
              border: selected ? '1px solid #00e676' : '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
              color,
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', background: '#ffffff1b' }}>
                <img src={imageUrl} alt="reference" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
              </div>
              <div
                style={{
                  fontFamily: `'${name}', system-ui, sans-serif`,
                  fontSize: 28,
                  lineHeight: 1.1,
                  color: '#fff',
                }}
              >
                omics
              </div>
            </div>
            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>Image + font preview</div>
          </div>
        </Html>
      </group>
    </Float>
  )
}

function Hud() {
  const query = useStore((s) => s.query)
  const layout = useStore((s) => s.layout)
  const selected = useStore((s) => s.selected)
  const toggleLayout = useStore((s) => s.toggleLayout)
  const setImageUrl = useStore((s) => s.setImageUrl)

  const exportSelection = () => {
    const list = Array.from(selected)
    const blob = new Blob([JSON.stringify({ fonts: list, count: list.length }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'selected-fonts.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const onPick = (file) => {
    if (!file) return
    const obj = URL.createObjectURL(file)
    setImageUrl(obj)
  }

  return (
    <div style={{ position: 'fixed', top: 16, left: 16, right: 16, display: 'flex', gap: 12, alignItems: 'center', zIndex: 20 }}>
      <input
        value={query}
        onChange={(e) => useStore.getState().setQuery(e.target.value)}
        placeholder="Search 100 fonts…"
        style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(20,20,24,0.6)', color: '#fff' }}
      />
      <label style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(20,20,24,0.6)', color: '#fff', cursor: 'pointer' }}>
        Change image
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onPick(e.target.files?.[0])} />
      </label>
      <button onClick={toggleLayout} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(20,20,24,0.6)', color: '#fff' }}>
        Layout: {layout === 'sphere' ? 'Sphere' : 'Grid'}
      </button>
      <button onClick={exportSelection} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: '#00e676', color: '#001b12', fontWeight: 700 }}>
        Export ({selected.size})
      </button>
    </div>
  )
}

function Scene() {
  const query = useStore((s) => s.query)
  const layout = useStore((s) => s.layout)
  const selected = useStore((s) => s.selected)
  const toggleSelect = useStore((s) => s.toggleSelect)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? FONT_FAMILIES.filter((f) => f.toLowerCase().includes(q)) : FONT_FAMILIES
  }, [query])

  const positions = useMemo(() => (layout === 'sphere' ? pointsOnSphere(filtered.length, 10) : pointsOnGrid(filtered.length, 10, 2)), [filtered.length, layout])

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
      <Stars radius={80} depth={50} count={4000} factor={2} saturation={0} fade speed={0.6} />
      <Environment preset="city" />

      {filtered.map((name, i) => (
        <FontTile key={name} name={name} position={positions[i]} selected={selected.has(name)} onClick={() => toggleSelect(name)} />
      ))}

      <OrbitControls makeDefault enablePan enableRotate enableZoom zoomSpeed={0.6} />
    </>
  )
}

export default function App() {
  useEffect(() => {
    injectGoogleFontsBatched(FONT_FAMILIES, 14)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#a5a5a5ff' }}>
      <Canvas camera={{ position: [0, 0, 20], fov: 50 }} dpr={[1, 2]}>
        <Scene />
      </Canvas>
      <Hud />
    </div>
  )
}
