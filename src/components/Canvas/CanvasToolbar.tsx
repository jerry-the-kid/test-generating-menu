import { useMenuStore } from '../../store/menuStore'
import type { PageSizePreset, SectionPreset } from '../../store/types'
import { GlobalTypographyPanel } from './GlobalTypographyPanel'
import './CanvasToolbar.css'

const SECTION_PRESETS: { preset: SectionPreset; label: string }[] = [
  { preset: 'full_width', label: 'Full Width' },
  { preset: 'two_col_equal', label: '2 Col Equal' },
  { preset: 'two_col_split', label: '2 Col Split' },
  { preset: 'three_col', label: '3 Col' },
]

const PAGE_PRESETS: { preset: PageSizePreset; label: string }[] = [
  { preset: 'A4', label: 'A4' },
  { preset: 'A3', label: 'A3' },
]

export function CanvasToolbar() {
  const addSection     = useMenuStore(s => s.addSection)
  const addArea        = useMenuStore(s => s.addArea)
  const deleteArea     = useMenuStore(s => s.deleteArea)
  const moveAreaUp     = useMenuStore(s => s.moveAreaUp)
  const moveAreaDown   = useMenuStore(s => s.moveAreaDown)
  const setAreaHeight  = useMenuStore(s => s.setAreaHeight)
  const setGridCols    = useMenuStore(s => s.setGridCols)
  const gridCols       = useMenuStore(s => s.doc.grid.cols)
  const pagePreset     = useMenuStore(s => s.doc.page.preset)
  const pagePadding    = useMenuStore(s => s.doc.page.padding)
  const setPagePreset  = useMenuStore(s => s.setPagePreset)
  const setPagePadding = useMenuStore(s => s.setPagePadding)
  const areas          = useMenuStore(s => s.doc.areas)
  const selectedAreaId = useMenuStore(s => s.selectedAreaId)

  const selectedArea = areas.find(a => a.id === selectedAreaId)

  return (
    <div className="canvas-toolbar">
      {/* Areas management */}
      <div className="toolbar-group">
        <label className="toolbar-label">Add Area:</label>
        <button
          className="toolbar-add-btn toolbar-add-fixed"
          onClick={() => addArea('Title', 'fixed')}
        >
          + Fixed
        </button>
        <button
          className="toolbar-add-btn toolbar-add-list"
          onClick={() => addArea('Menu Items', 'list')}
        >
          + List
        </button>
      </div>

      {/* Area controls when selected */}
      {selectedArea && (
        <>
          <div className="toolbar-divider" />
          <div className="toolbar-group">
            <label className="toolbar-label">Area [{selectedArea.name}]:</label>
            <button className="toolbar-btn-sm" onClick={() => moveAreaUp(selectedArea.id)} title="Move area up">↑</button>
            <button className="toolbar-btn-sm" onClick={() => moveAreaDown(selectedArea.id)} title="Move area down">↓</button>
            <button className="toolbar-btn-sm danger" onClick={() => deleteArea(selectedArea.id)} title="Delete area">✕</button>
            {selectedArea.type === 'list' && (
              <>
                <label className="toolbar-label" style={{ marginLeft: 8 }}>Height:</label>
                <select
                  className="toolbar-select"
                  value={selectedArea.height === 'auto' ? 'auto' : 'custom'}
                  onChange={(e) => {
                    if (e.target.value === 'auto') {
                      setAreaHeight(selectedArea.id, 'auto')
                    } else {
                      setAreaHeight(selectedArea.id, 400)
                    }
                  }}
                >
                  <option value="auto">Auto (fill)</option>
                  <option value="custom">Custom</option>
                </select>
                {selectedArea.height !== 'auto' && (
                  <input
                    type="number"
                    min={100}
                    max={2000}
                    value={selectedArea.height}
                    onChange={(e) => setAreaHeight(selectedArea.id, Number(e.target.value))}
                    className="toolbar-num-input"
                    style={{ width: 60 }}
                  />
                )}
              </>
            )}
          </div>

          <div className="toolbar-divider" />

          {/* Add sections to selected area */}
          <div className="toolbar-group">
            <label className="toolbar-label">Add Section:</label>
            {SECTION_PRESETS.map(({ preset, label }) => (
              <button
                key={preset}
                className="toolbar-add-btn"
                onClick={() => addSection(selectedArea.id, preset)}
              >
                + {label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <label className="toolbar-label">Grid Cols:</label>
        {([1, 2, 3, 4] as const).map(col => (
          <button
            key={col}
            className={`toolbar-col-btn ${gridCols === col ? 'active' : ''}`}
            onClick={() => setGridCols(col)}
          >
            {col}
          </button>
        ))}
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <label className="toolbar-label">Page Size:</label>
        {PAGE_PRESETS.map(({ preset, label }) => (
          <button
            key={preset}
            className={`toolbar-col-btn ${pagePreset === preset ? 'active' : ''}`}
            onClick={() => setPagePreset(preset)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <label className="toolbar-label">Padding (mm):</label>
        {(['top', 'right', 'bottom', 'left'] as const).map(side => (
          <label key={side} className="toolbar-label" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {side[0].toUpperCase()}
            <input
              type="number"
              min={0}
              max={50}
              value={pagePadding[side]}
              onChange={e => setPagePadding({ [side]: Number(e.target.value) })}
              className="toolbar-num-input"
              style={{ width: 40 }}
            />
          </label>
        ))}
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <label className="toolbar-label">Typography:</label>
        <GlobalTypographyPanel />
      </div>
    </div>
  )
}
