import React, { useState, useEffect } from 'react'

const FontGridApp = () => {
  const [fonts, setFonts] = useState([])
  const [loadedFonts, setLoadedFonts] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFonts, setSelectedFonts] = useState(new Set())
  const [sortBy, setSortBy] = useState('name') // name, size

  // Font files from the 00fonts directory
  const fontFiles = [
    'Alterday.otf',
    'American Signature.otf',
    'American Signature.ttf',
    'Amsterdam Handwriting.ttf',
    'Anthony Gilford.otf',
    'Anything Script_1 Italic TTF.ttf',
    'Anything Script_1 TTF.ttf',
    'Anything Script_2 Italic TTF.ttf',
    'Anything Script_2 TTF.ttf',
    'Anything Script_3 Italic TTF.ttf',
    'Anything Script_3 TTF.ttf',
    'Anything Script_4 Italic TTF.ttf',
    'Anything Script_4 TTF.ttf',
    'Arietta Hudson.otf',
    'Bastliga One.otf',
    'Bastliga One.ttf',
    'beautifully-delicious-script-regular.ttf',
    'Begerak.ttf',
    'Bellamye.otf',
    'Bridget Signature.otf',
    'Castende.otf',
    'Castende.ttf',
    'Creattion Demo.otf',
    'Dalton White.otf',
    'DancingScript-VariableFont_wght.ttf',
    'Domestic Script.otf',
    'donitta.otf',
    'Gateway Signature.ttf',
    'Gosseliena.ttf',
    'Gravity Personal Use Only.ttf',
    'Handwritten.otf',
    'Hatteria.otf',
    'Healing Fairy Signature.otf',
    'Hedland.ttf',
    'High Empathy.otf',
    'High Empathy.ttf',
    'Hugetta Amphals DEMO VERSION.otf',
    'Hugetta Amphals DEMO VERSION.ttf',
    'IdeasRegular.ttf',
    'Jalliya.otf',
    'Jalliya.ttf',
    'Jonathan Signature.otf',
    'Le Jour Script 400.otf',
    'Mastrih.otf',
    'Megalin.otf',
    'Merlinda Signature Demo.ttf',
    'modernline bold.otf',
    'modernline.otf',
    'ModernSignature.ttf',
    'MonitaSignaturePERSONALUSE-Bold.otf',
    'MonitaSignaturePERSONALUSE-BoldItalic.otf',
    'MonitaSignaturePERSONALUSE-Regular.otf',
    'MonitaSignaturePERSONALUSE-RegularItalic.otf',
    'NorthBalgimosh-Italic.otf',
    'Notera_PersonalUseOnly.ttf',
    'OceanTrace.ttf',
    'Oriental Village.otf',
    'OTF.otf',
    'Palisade.otf',
    'Paragraph.otf',
    'Peony Whisper.otf',
    'Pushkin.ttf',
    'Quetine.otf',
    'Quetine.ttf',
    'Rhesmanisa.otf',
    'RomeoHandwritten.ttf',
    'Southwest Partisan Demo.otf',
    'StoryOfLove.ttf',
    'Thesignature.otf',
    'Thesignature.ttf',
    'Together.ttf',
    'TT-Lovelies-Script-Trial-BF66a123b1a748a.ttf',
    'Vegan Days.otf',
    'Vegan Days.ttf',
    'Wishday.otf',
    'Wishday.ttf'
  ]

  useEffect(() => {
    loadFonts()
  }, [])

  const loadFonts = async () => {
    const fontPromises = fontFiles.map(async (fontFile) => {
      const fontName = fontFile.replace(/\.(otf|ttf)$/i, '').replace(/[-_]/g, ' ')
      
      try {
        const font = new FontFace(
          fontName,
          `url(/00fonts/${fontFile})`
        )
        
        await font.load()
        document.fonts.add(font)
        
        return {
          name: fontName,
          file: fontFile,
          loaded: true
        }
      } catch (error) {
        console.warn(`Failed to load font: ${fontName}`, error)
        return {
          name: fontName,
          file: fontFile,
          loaded: false,
          error: error.message
        }
      }
    })

    const loadedFonts = await Promise.all(fontPromises)
    setFonts(loadedFonts.filter(font => font.loaded))
  }

  const toggleFontSelection = (fontName) => {
    setSelectedFonts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fontName)) {
        newSet.delete(fontName)
      } else {
        newSet.add(fontName)
      }
      return newSet
    })
  }

  const exportSelectedFonts = () => {
    const selectedList = Array.from(selectedFonts)
    const data = {
      selectedFonts: selectedList,
      count: selectedList.length,
      timestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'selected-fonts.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredFonts = fonts.filter(font => 
    font.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedFonts = [...filteredFonts].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name)
    }
    return 0
  })

  const renderNutriomicsImage = () => {
    return (
      <img
        src="/nutriomics.png"
        alt="Nutriomics Logo"
        style={{
          width: '64px',
          height: '80px',
          objectFit: 'contain',
          display: 'block'
        }}
      />
    )
  }

  const FontCard = ({ font }) => {
    const isSelected = selectedFonts.has(font.name)
    
    return (
      <div
        onClick={() => toggleFontSelection(font.name)}
        style={{
          border: `2px solid ${isSelected ? '#007bff' : '#e9ecef'}`,
          borderRadius: '12px',
          padding: '20px',
          backgroundColor: isSelected ? '#f8f9fa' : '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isSelected ? '0 4px 12px rgba(0,123,255,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
          transform: isSelected ? 'translateY(-2px)' : 'translateY(0)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            minHeight: '80px',
            gap: '0px'
          }}
        >
          {/* Nutriomics Image */}
          <div style={{ position: 'relative' }}>
            {renderNutriomicsImage()}
          </div>
          
          {/* utriomics text */}
          <div
            style={{
              fontFamily: `"${font.name}", system-ui, sans-serif`,
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#000000',
              lineHeight: 1
            }}
          >
            utriomics
          </div>
        </div>
        
        <div
          style={{
            fontSize: '12px',
            color: '#6c757d',
            textAlign: 'center',
            marginBottom: '8px',
            fontWeight: '500'
          }}
        >
          {font.name}
        </div>
        
        <div
          style={{
            fontSize: '10px',
            color: '#adb5bd',
            textAlign: 'center',
            fontFamily: 'monospace'
          }}
        >
          {font.file}
        </div>
        
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '20px',
              height: '20px',
              backgroundColor: '#007bff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            ✓
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '20px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '32px', 
          fontWeight: 'bold',
          color: '#212529',
          textAlign: 'center'
        }}>
          Font Gallery - Nutriomics + utriomics
        </h1>
        <p style={{ 
          margin: '8px 0 0 0', 
          fontSize: '16px', 
          color: '#6c757d',
          textAlign: 'center'
        }}>
          {fonts.length} fonts loaded • {selectedFonts.size} selected
        </p>
      </div>

      {/* Controls */}
      <div style={{ 
        padding: '16px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#495057' }}>
            Search:
          </label>
          <input
            type="text"
            placeholder="Search fonts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '6px',
              fontSize: '14px',
              width: '200px'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#495057' }}>
            Sort:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="name">Name</option>
          </select>
        </div>


        <button
          onClick={exportSelectedFonts}
          disabled={selectedFonts.size === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: selectedFonts.size > 0 ? '#007bff' : '#6c757d',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: selectedFonts.size > 0 ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s ease'
          }}
        >
          Export Selected ({selectedFonts.size})
        </button>

        <button
          onClick={() => setSelectedFonts(new Set())}
          disabled={selectedFonts.size === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: selectedFonts.size > 0 ? '#dc3545' : '#6c757d',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: selectedFonts.size > 0 ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s ease'
          }}
        >
          Clear Selection
        </button>
      </div>

      {/* Font Grid */}
      <div style={{ 
        flex: 1,
        padding: '20px',
        overflow: 'auto',
        backgroundColor: '#f8f9fa'
      }}>
        {fonts.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: '18px',
            color: '#6c757d'
          }}>
            Loading fonts...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {sortedFonts.map((font, index) => (
              <div key={font.name} style={{ position: 'relative' }}>
                <FontCard font={font} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FontGridApp