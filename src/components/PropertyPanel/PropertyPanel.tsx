import { useMenuStore } from '../../store/menuStore'
import type { Block } from '../../store/types'
import './PropertyPanel.css'

export function PropertyPanel() {
  const selectedBlockId = useMenuStore(s => s.selectedBlockId)
  const doc = useMenuStore(s => s.doc)
  const updateBlock = useMenuStore(s => s.updateBlock)

  // Find the selected block
  let selectedBlock: Block | null = null
  if (selectedBlockId) {
    for (const area of doc.areas) {
      for (const section of area.sections) {
        for (const pane of section.panes) {
          const block = pane.blocks.find(b => b.id === selectedBlockId)
          if (block) {
            selectedBlock = block
            break
          }
        }
        if (selectedBlock) break
      }
      if (selectedBlock) break
    }
  }

  if (!selectedBlock) {
    return (
      <div className="property-panel">
        <div className="panel-empty">
          <p>Select a block to edit its properties</p>
        </div>
      </div>
    )
  }

  return (
    <div className="property-panel">
      <h3 className="panel-title">{selectedBlock.type.replace('_', ' ')}</h3>
      <div className="panel-fields">
        {/* Margin controls for all blocks */}
        <div className="panel-field">
          <label className="field-label">Margin Top (px)</label>
          <input
            type="number"
            value={selectedBlock.marginTop}
            disabled={selectedBlock.locked}
            onChange={(e) => updateBlock(selectedBlock!.id, { marginTop: Number(e.target.value) })}
            className="field-input"
            min={0}
          />
        </div>
        <div className="panel-field">
          <label className="field-label">Margin Bottom (px)</label>
          <input
            type="number"
            value={selectedBlock.marginBottom}
            disabled={selectedBlock.locked}
            onChange={(e) => updateBlock(selectedBlock!.id, { marginBottom: Number(e.target.value) })}
            className="field-input"
            min={0}
          />
        </div>

        {/* Type-specific fields */}
        {renderBlockFields(selectedBlock, updateBlock)}
      </div>
    </div>
  )
}

function renderBlockFields(block: Block, updateBlock: (id: string, patch: Partial<Block>) => void) {
  switch (block.type) {
    case 'heading':
      return (
        <div className="panel-field">
          <p className="field-hint">Use the inline toolbar to edit text formatting</p>
        </div>
      )
    case 'subheading':
      return (
        <div className="panel-field">
          <p className="field-hint">Use the inline toolbar to edit text formatting</p>
        </div>
      )
    case 'menu':
      return (
        <div className="panel-field">
          <p className="field-hint">Click the block to open the editor dialog</p>
        </div>
      )
    case 'image':
      return (
        <>
          <div className="panel-field">
            <label className="field-label">URL</label>
            <input type="text" value={block.url} onChange={e => updateBlock(block.id, { url: e.target.value } as any)} className="field-input" />
          </div>
          <div className="panel-field">
            <label className="field-label">Alt Text</label>
            <input type="text" value={block.alt} onChange={e => updateBlock(block.id, { alt: e.target.value } as any)} className="field-input" />
          </div>
          <div className="panel-field">
            <label className="field-label">Fit</label>
            <select value={block.fit} onChange={e => updateBlock(block.id, { fit: e.target.value } as any)} className="field-input">
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="fill">Fill</option>
            </select>
          </div>
          <div className="panel-field">
            <label className="field-label">Aspect Ratio</label>
            <input type="text" value={block.aspectRatio} onChange={e => updateBlock(block.id, { aspectRatio: e.target.value } as any)} className="field-input" placeholder="16/9" />
          </div>
        </>
      )
    case 'logo_name':
      return (
        <div className="panel-field">
          <p className="field-hint">Click the block to open the editor dialog</p>
        </div>
      )
  }
}
