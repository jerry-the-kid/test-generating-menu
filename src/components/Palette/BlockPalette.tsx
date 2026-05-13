import { useActivePaneId, useDoc, useMenuActions, useSelectedSectionId } from '../../store/menuStore'
import { findSectionInDoc } from '../../store/helpers'
import type { BlockType, Section } from '../../store/types'

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

function findFirstSection(doc: ReturnType<typeof useDoc>): Section | null {
  for (const area of doc.areas) {
    if (area.sections.length > 0) return area.sections[0]
  }
  return null
}

export function BlockPalette() {
  const doc = useDoc()
  const { addBlock } = useMenuActions()
  const selectedSectionId = useSelectedSectionId()
  const activePaneId = useActivePaneId()

  const activeSection: Section | null =
    (selectedSectionId ? findSectionInDoc(doc, selectedSectionId)?.section : undefined)
    ?? findFirstSection(doc)

  const handleAddBlock = (type: BlockType) => {
    if (!activeSection) return
    const pane = activePaneId
      ? activeSection.panes.find((p) => p.id === activePaneId)
      : activeSection.panes[0]
    if (!pane) return
    addBlock(activeSection.id, pane.id, type)
  }

  return (
    <div className="h-full overflow-y-auto p-3 bg-slate-50 border-r border-slate-200">
      <h3 className="text-sm font-semibold mb-1 text-slate-700">Blocks</h3>
      <div className="text-[11px] text-slate-500 mb-3 px-2 py-[5px] bg-slate-100 rounded min-h-6">
        {activeSection
          ? <>Adding to: <strong className="text-blue-500 capitalize">{activeSection.type.replace(/_/g, ' ')}</strong></>
          : <span className="text-slate-400 italic">Click a pane to set destination</span>
        }
      </div>
      {CATEGORIES.map(cat => (
        <div key={cat} className="mb-4">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-400 mb-1.5">{cat}</h4>
          <div className="flex flex-col gap-1">
            {PALETTE_ITEMS.filter(i => i.category === cat).map(item => (
              <button
                key={item.type}
                className="flex items-center gap-2 px-2.5 py-2 border border-slate-200 rounded-md bg-white cursor-pointer text-[13px] text-slate-700 transition-all duration-150 hover:border-blue-500 hover:bg-blue-50"
                onClick={() => handleAddBlock(item.type)}
                title={item.label}
              >
                <span className="flex-1">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
