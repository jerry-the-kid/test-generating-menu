import { useMenuActions } from '../../store/menuStore'
import type { Area, SectionPreset } from '../../store/types'

const SECTION_PRESETS: { preset: SectionPreset; label: string }[] = [
  { preset: 'full_width', label: 'Full Width' },
  { preset: 'two_col_equal', label: '2 Col Equal' },
  { preset: 'two_col_split', label: '2 Col Split' },
  { preset: 'three_col', label: '3 Col' },
]

const BTN =
  'px-2.5 py-1 border border-slate-200 rounded bg-white text-xs cursor-pointer text-slate-600 transition-all duration-100 hover:border-blue-500 hover:bg-blue-50'
const BTN_DANGER =
  'px-2.5 py-1 border border-slate-200 rounded bg-white text-xs cursor-pointer text-slate-600 transition-all duration-100 hover:border-red-500 hover:bg-red-50 hover:text-red-600'
const LABEL = 'text-[11px] font-semibold capitalize text-slate-500'
const INPUT =
  'h-7 border border-slate-200 rounded px-1.5 text-xs text-slate-600 bg-white focus:outline-none focus:border-blue-500'

export function AreaPanel({ area }: { area: Area }) {
  const {
    moveAreaUp,
    moveAreaDown,
    deleteArea,
    setAreaHeight,
    addSection,
  } = useMenuActions()

  return (
    <>
      <h3 className="text-sm font-semibold mb-1 text-slate-700">Area</h3>
      <p className="text-xs text-slate-400 mb-4">
        {area.name} <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 uppercase tracking-wide">{area.type}</span>
      </p>

      <div className="flex flex-col gap-3">
        <div className="flex gap-1.5">
          <button className={BTN} onClick={() => moveAreaUp(area.id)} title="Move area up">↑ Up</button>
          <button className={BTN} onClick={() => moveAreaDown(area.id)} title="Move area down">↓ Down</button>
        </div>
        <button className={BTN_DANGER} onClick={() => deleteArea(area.id)} title="Delete area">
          Delete area
        </button>

        {area.type === 'list' && (
          <div className="flex flex-col gap-1">
            <label className={LABEL}>Height</label>
            <div className="flex items-center gap-1.5">
              <select
                className={INPUT}
                value={area.height === 'auto' ? 'auto' : 'custom'}
                onChange={(e) => {
                  if (e.target.value === 'auto') setAreaHeight(area.id, 'auto')
                  else setAreaHeight(area.id, 400)
                }}
              >
                <option value="auto">Auto (fill)</option>
                <option value="custom">Custom</option>
              </select>
              {area.height !== 'auto' && (
                <input
                  type="number"
                  min={100}
                  max={2000}
                  value={area.height}
                  onChange={(e) => setAreaHeight(area.id, Number(e.target.value))}
                  className={`${INPUT} w-16 text-center`}
                />
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className={LABEL}>Add Section</label>
          <div className="flex flex-wrap gap-1.5">
            {SECTION_PRESETS.map(({ preset, label }) => (
              <button
                key={preset}
                className={BTN}
                onClick={() => addSection(area.id, preset)}
              >
                + {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
