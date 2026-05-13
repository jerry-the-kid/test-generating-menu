import { useMenuActions, usePageConfig, useSelectedArea } from '../../store/menuStore'
import type { PageSizePreset, SectionPreset } from '../../store/types'
import { GlobalTypographyPanel } from './GlobalTypographyPanel'

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

const LABEL = 'text-xs font-semibold text-slate-500'
const GROUP = 'flex items-center gap-1.5'
const DIVIDER = 'w-px h-5 bg-slate-200'
const ADD_BTN =
  'px-2.5 py-1 border border-slate-200 rounded bg-white text-xs cursor-pointer text-slate-600 transition-all duration-100 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-500'
const ADD_FIXED =
  'px-2.5 py-1 rounded text-xs cursor-pointer transition-all duration-100 border border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-400 hover:bg-amber-100 hover:text-amber-950'
const ADD_LIST =
  'px-2.5 py-1 rounded text-xs cursor-pointer transition-all duration-100 border border-blue-400 bg-blue-50 text-blue-900 hover:border-blue-500 hover:bg-blue-100 hover:text-blue-950'
const BTN_SM =
  'w-6 h-6 border border-slate-200 rounded bg-white text-xs cursor-pointer text-slate-600 flex items-center justify-center transition-all duration-100 hover:border-blue-500 hover:bg-blue-50'
const BTN_SM_DANGER =
  'w-6 h-6 border border-slate-200 rounded bg-white text-xs cursor-pointer text-slate-600 flex items-center justify-center transition-all duration-100 hover:border-red-500 hover:bg-red-50 hover:text-red-600'
const NUM_INPUT =
  'h-7 border border-slate-200 rounded px-1 text-xs text-slate-600 text-center focus:outline-none focus:border-blue-500'
const SELECT =
  'h-7 border border-slate-200 rounded px-1.5 text-xs text-slate-600 bg-white focus:outline-none focus:border-blue-500'
const COL_BTN =
  'w-7 h-7 border border-slate-200 rounded bg-white text-xs font-semibold cursor-pointer text-slate-600 transition-all duration-100 hover:border-blue-500'
const COL_BTN_ACTIVE =
  'w-7 h-7 border rounded text-xs font-semibold cursor-pointer transition-all duration-100 bg-blue-500 border-blue-500 text-white'

export function CanvasToolbar() {
  const {
    addSection,
    addArea,
    deleteArea,
    moveAreaUp,
    moveAreaDown,
    setAreaHeight,
    setPagePreset,
    setPagePadding,
  } = useMenuActions()
  const { preset: pagePreset, padding: pagePadding } = usePageConfig()
  const selectedArea = useSelectedArea()

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-slate-200 flex-wrap">
      {/* Areas management */}
      <div className={GROUP}>
        <label className={LABEL}>Add Area:</label>
        <button className={ADD_FIXED} onClick={() => addArea('Title', 'fixed')}>+ Fixed</button>
        <button className={ADD_LIST} onClick={() => addArea('Menu Items', 'list')}>+ List</button>
      </div>

      {/* Area controls when selected */}
      {selectedArea && (
        <>
          <div className={DIVIDER} />
          <div className={GROUP}>
            <label className={LABEL}>Area [{selectedArea.name}]:</label>
            <button className={BTN_SM} onClick={() => moveAreaUp(selectedArea.id)} title="Move area up">↑</button>
            <button className={BTN_SM} onClick={() => moveAreaDown(selectedArea.id)} title="Move area down">↓</button>
            <button className={BTN_SM_DANGER} onClick={() => deleteArea(selectedArea.id)} title="Delete area">✕</button>
            {selectedArea.type === 'list' && (
              <>
                <label className={`${LABEL} ml-2`}>Height:</label>
                <select
                  className={SELECT}
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
                    className={`${NUM_INPUT} w-[60px]`}
                  />
                )}
              </>
            )}
          </div>

          <div className={DIVIDER} />

          {/* Add sections to selected area */}
          <div className={GROUP}>
            <label className={LABEL}>Add Section:</label>
            {SECTION_PRESETS.map(({ preset, label }) => (
              <button
                key={preset}
                className={ADD_BTN}
                onClick={() => addSection(selectedArea.id, preset)}
              >
                + {label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className={DIVIDER} />

      <div className={GROUP}>
        <label className={LABEL}>Page Size:</label>
        {PAGE_PRESETS.map(({ preset, label }) => (
          <button
            key={preset}
            className={pagePreset === preset ? COL_BTN_ACTIVE : COL_BTN}
            onClick={() => setPagePreset(preset)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={DIVIDER} />

      <div className={GROUP}>
        <label className={LABEL}>Padding (mm):</label>
        {(['top', 'right', 'bottom', 'left'] as const).map(side => (
          <label key={side} className={`${LABEL} flex items-center gap-0.5`}>
            {side[0].toUpperCase()}
            <input
              type="number"
              min={0}
              max={50}
              value={pagePadding[side]}
              onChange={e => setPagePadding({ [side]: Number(e.target.value) })}
              className={`${NUM_INPUT} w-10`}
            />
          </label>
        ))}
      </div>

      <div className={DIVIDER} />

      <div className={GROUP}>
        <label className={LABEL}>Typography:</label>
        <GlobalTypographyPanel />
      </div>
    </div>
  )
}
