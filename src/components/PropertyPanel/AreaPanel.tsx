import { useMenuActions } from '../../store/menuStore'
import type { Area, AreaAlignment, AreaSpacing, SectionPreset } from '../../store/types'

const SECTION_PRESETS: { preset: SectionPreset; label: string }[] = [
  { preset: 'full_width', label: 'Full Width' },
  { preset: 'two_col_equal', label: '2 Col Equal' },
  { preset: 'two_col_split', label: '2 Col Split' },
  { preset: 'three_col', label: '3 Col' },
]

const ALIGNMENTS: { value: AreaAlignment; label: string; icon: string; title: string }[] = [
  { value: 'left', label: 'Left', icon: '⇤', title: 'Align left (mr-auto)' },
  { value: 'center', label: 'Center', icon: '↔', title: 'Center (mx-auto)' },
  { value: 'right', label: 'Right', icon: '⇥', title: 'Align right (ml-auto)' },
]

const BTN =
  'px-2.5 py-1 border border-slate-200 rounded bg-white text-xs cursor-pointer text-slate-600 transition-all duration-100 hover:border-blue-500 hover:bg-blue-50'
const BTN_DANGER =
  'px-2.5 py-1 border border-slate-200 rounded bg-white text-xs cursor-pointer text-slate-600 transition-all duration-100 hover:border-red-500 hover:bg-red-50 hover:text-red-600'
const LABEL = 'text-[11px] font-semibold capitalize text-slate-500'
const INPUT =
  'h-7 border border-slate-200 rounded px-1.5 text-xs text-slate-600 bg-white focus:outline-none focus:border-blue-500'
const INPUT_DISABLED =
  'h-7 border border-slate-200 rounded px-1.5 text-xs text-slate-400 bg-slate-100 cursor-not-allowed'
const SECTION_DIVIDER = 'border-t border-slate-200 pt-3 mt-1'

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : lo))
}

interface SpacingBoxProps {
  values: AreaSpacing
  /** Which sides should render as disabled (e.g. ['left','right'] for margin in center mode) */
  disabledSides?: Array<keyof AreaSpacing>
  onChange: (patch: Partial<AreaSpacing>) => void
}

function SpacingBox({ values, disabledSides = [], onChange }: SpacingBoxProps) {
  const isDisabled = (side: keyof AreaSpacing) => disabledSides.includes(side)

  const fieldClass = (side: keyof AreaSpacing) =>
    `${isDisabled(side) ? INPUT_DISABLED : INPUT} w-12 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`

  const handle = (side: keyof AreaSpacing) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled(side)) return
    onChange({ [side]: clamp(Number(e.target.value), 0, 999) } as Partial<AreaSpacing>)
  }

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] grid-rows-3 gap-1 items-center justify-items-center w-full">
      <span />
      <input
        type="number"
        min={0}
        value={values.top}
        onChange={handle('top')}
        disabled={isDisabled('top')}
        className={fieldClass('top')}
        title="Top"
      />
      <span />
      <input
        type="number"
        min={0}
        value={values.left}
        onChange={handle('left')}
        disabled={isDisabled('left')}
        className={fieldClass('left')}
        title={isDisabled('left') ? 'Disabled — alignment uses auto on this side' : 'Left'}
      />
      <span className="text-[10px] text-slate-300 px-1">↔</span>
      <input
        type="number"
        min={0}
        value={values.right}
        onChange={handle('right')}
        disabled={isDisabled('right')}
        className={fieldClass('right')}
        title={isDisabled('right') ? 'Disabled — alignment uses auto on this side' : 'Right'}
      />
      <span />
      <input
        type="number"
        min={0}
        value={values.bottom}
        onChange={handle('bottom')}
        disabled={isDisabled('bottom')}
        className={fieldClass('bottom')}
        title="Bottom"
      />
      <span />
    </div>
  )
}

export function AreaPanel({ area }: { area: Area }) {
  const {
    moveAreaUp,
    moveAreaDown,
    deleteArea,
    setAreaHeight,
    setAreaGap,
    setAreaWidthPercent,
    setAreaAlignment,
    setAreaMargin,
    setAreaPadding,
    addSection,
  } = useMenuActions()

  // Sides that are overridden by 'auto' from alignment shortcuts.
  const marginDisabled: Array<keyof AreaSpacing> =
    area.alignment === 'center'
      ? ['left', 'right']
      : area.alignment === 'left'
        ? ['right']
        : ['left']

  return (
    <>
      <h3 className="text-sm font-semibold mb-1 text-slate-700">Area</h3>
      <p className="text-xs text-slate-400 mb-4">
        {area.name}{' '}
        <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 uppercase tracking-wide">
          {area.type}
        </span>
      </p>

      <div className="flex flex-col gap-3">
        <div className="flex gap-1.5">
          <button className={BTN} onClick={() => moveAreaUp(area.id)} title="Move area up">
            ↑ Up
          </button>
          <button className={BTN} onClick={() => moveAreaDown(area.id)} title="Move area down">
            ↓ Down
          </button>
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

        {/* Width */}
        <div className={`${SECTION_DIVIDER} flex flex-col gap-1.5`}>
          <div className="flex items-center justify-between">
            <label className={LABEL}>Width</label>
            <span className="text-[11px] text-slate-500 font-medium">{area.widthPercent}%</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={area.widthPercent}
              onChange={(e) => setAreaWidthPercent(area.id, Number(e.target.value))}
              className="flex-1 accent-blue-500 cursor-pointer"
            />
            <input
              type="number"
              min={10}
              max={100}
              value={area.widthPercent}
              onChange={(e) => setAreaWidthPercent(area.id, Number(e.target.value))}
              className={`${INPUT} w-14 text-center`}
            />
          </div>
        </div>

        {/* Alignment */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL}>Alignment</label>
          <div className="grid grid-cols-3 gap-1">
            {ALIGNMENTS.map(({ value, label, icon, title }) => {
              const active = area.alignment === value
              return (
                <button
                  key={value}
                  onClick={() => setAreaAlignment(area.id, value)}
                  title={title}
                  className={
                    'flex flex-col items-center justify-center gap-0.5 py-1.5 border rounded text-xs cursor-pointer transition-all duration-100 ' +
                    (active
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:bg-blue-50')
                  }
                >
                  <span className="text-base leading-none">{icon}</span>
                  <span className="text-[10px]">{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Section gap */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL}>Section gap</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={200}
              value={area.gap}
              onChange={(e) => setAreaGap(area.id, Number(e.target.value))}
              className={`${INPUT} w-16 text-center`}
            />
            <span className="text-[11px] text-slate-400">px between sections</span>
          </div>
        </div>

        {/* Margin */}
        <div className={`${SECTION_DIVIDER} flex flex-col gap-1.5`}>
          <div className="flex items-center justify-between">
            <label className={LABEL}>Margin (px)</label>
            {marginDisabled.length > 0 && (
              <span className="text-[10px] text-slate-400 italic">
                {area.alignment === 'center' ? 'L/R: auto' : `${marginDisabled[0]}: auto`}
              </span>
            )}
          </div>
          <SpacingBox
            values={area.margin}
            disabledSides={marginDisabled}
            onChange={(patch) => setAreaMargin(area.id, patch)}
          />
        </div>

        {/* Padding */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL}>Padding (px)</label>
          <SpacingBox values={area.padding} onChange={(patch) => setAreaPadding(area.id, patch)} />
        </div>

        {/* Add Section */}
        <div className={`${SECTION_DIVIDER} flex flex-col gap-1`}>
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
