import { useMenuStore } from '../../store/menuStore'
import type { BlockType } from '../../store/types'
import './BlockPalette.css'

interface PaletteItem {
  type: BlockType
  label: string
  category: string
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'heading', label: 'Heading', category: 'Text' },
  { type: 'subheading', label: 'Subheading', category: 'Text' },
  { type: 'menu', label: 'Menu', category: 'Menu' },
  { type: 'image', label: 'Image', category: 'Media' },
  { type: 'logo_name', label: 'Logo & Name', category: 'Brand' },
]

const CATEGORIES = ['Text', 'Menu', 'Media', 'Brand']

export function BlockPalette() {
  const doc = useMenuStore(s => s.doc)
  const addBlock = useMenuStore(s => s.addBlock)
  const selectedSectionId = useMenuStore(s => s.selectedSectionId)
  const activePaneId = useMenuStore(s => s.activePaneId)

  const handleAddBlock = (type: BlockType) => {
    // Find section in areas structure
    let section = null
    if (selectedSectionId) {
      for (const area of doc.areas) {
        const found = area.sections.find(s => s.id === selectedSectionId)
        if (found) { section = found; break }
      }
    }
    if (!section) {
      // Fall back to first section in first area
      for (const area of doc.areas) {
        if (area.sections.length > 0) { section = area.sections[0]; break }
      }
    }
    if (!section) return
    const pane = activePaneId
      ? section.panes.find(p => p.id === activePaneId)
      : section.panes[0]
    if (!pane) return
    addBlock(section.id, pane.id, type)
  }

  let activeSection = null
  if (selectedSectionId) {
    for (const area of doc.areas) {
      const found = area.sections.find(s => s.id === selectedSectionId)
      if (found) { activeSection = found; break }
    }
  }
  if (!activeSection) {
    for (const area of doc.areas) {
      if (area.sections.length > 0) { activeSection = area.sections[0]; break }
    }
  }

  return (
    <div className="block-palette">
      <h3 className="palette-title">Blocks</h3>
      <div className="palette-target">
        {activeSection
          ? <>Adding to: <strong>{activeSection.type.replace(/_/g, ' ')}</strong></>
          : <span className="palette-target-hint">Click a pane to set destination</span>
        }
      </div>
      {CATEGORIES.map(cat => (
        <div key={cat} className="palette-category">
          <h4 className="category-label">{cat}</h4>
          <div className="palette-items">
            {PALETTE_ITEMS.filter(i => i.category === cat).map(item => (
              <button
                key={item.type}
                className="palette-item"
                onClick={() => handleAddBlock(item.type)}
                title={item.label}
              >
                <span className="palette-item-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
