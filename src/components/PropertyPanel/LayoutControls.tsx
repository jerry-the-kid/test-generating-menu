import type { Alignment, Spacing } from '../../store/types'

export const PANEL_LABEL = 'text-[11px] font-semibold capitalize text-slate-500'
export const PANEL_INPUT =
  'h-7 border border-slate-200 rounded px-1.5 text-xs text-slate-600 bg-white focus:outline-none focus:border-blue-500'
const PANEL_INPUT_DISABLED =
  'h-7 border border-slate-200 rounded px-1.5 text-xs text-slate-400 bg-slate-100 cursor-not-allowed'
export const PANEL_SECTION_DIVIDER = 'border-t border-slate-200 pt-3 mt-1'

const ALIGNMENTS: { value: Alignment; label: string; icon: string; title: string }[] = [
  { value: 'left', label: 'Left', icon: '⇤', title: 'Align left (mr-auto)' },
  { value: 'center', label: 'Center', icon: '↔', title: 'Center (mx-auto)' },
  { value: 'right', label: 'Right', icon: '⇥', title: 'Align right (ml-auto)' },
]

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : lo))
}

export function WidthControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className={PANEL_LABEL}>Width</label>
        <span className="text-[11px] text-slate-500 font-medium">{value}%</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={10}
          max={100}
          step={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-blue-500 cursor-pointer"
        />
        <input
          type="number"
          min={10}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`${PANEL_INPUT} w-14 text-center`}
        />
      </div>
    </div>
  )
}

export function HeightControl({
  value,
  onChange,
  uncheckInitialPercent = 10,
}: Readonly<{
  value: 'min-content' | number
  onChange: (v: 'min-content' | number) => void
  uncheckInitialPercent?: number
}>) {
  const isAuto = value === 'min-content'
  const numericValue = typeof value === 'number' ? value : 100
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className={PANEL_LABEL}>Height</label>
        <span className="text-[11px] text-slate-500 font-medium">
          {isAuto ? 'min-content' : `${numericValue}%`}
        </span>
      </div>
      <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isAuto}
          onChange={(e) => onChange(e.target.checked ? 'min-content' : uncheckInitialPercent)}
          className="accent-blue-500 cursor-pointer"
        />
        Min-content (auto)
      </label>
      {!isAuto && (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={numericValue}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 accent-blue-500 cursor-pointer"
          />
          <input
            type="number"
            min={5}
            max={100}
            value={numericValue}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`${PANEL_INPUT} w-14 text-center`}
          />
        </div>
      )}
    </div>
  )
}

export function AlignmentControl({
  value,
  onChange,
}: Readonly<{
  value: Alignment
  onChange: (a: Alignment) => void
}>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={PANEL_LABEL}>Alignment</label>
      <div className="grid grid-cols-3 gap-1">
        {ALIGNMENTS.map(({ value: v, label, icon, title }) => {
          const active = value === v
          return (
            <button
              key={v}
              onClick={() => onChange(v)}
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
  )
}

export function GapControl({
  value,
  onChange,
  label = 'Gap',
  hint,
  max = 200,
}: {
  value: number
  onChange: (v: number) => void
  label?: string
  hint?: string
  max?: number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={PANEL_LABEL}>{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`${PANEL_INPUT} w-16 text-center`}
        />
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
    </div>
  )
}

interface SpacingBoxProps {
  values: Spacing
  disabledSides?: Array<keyof Spacing>
  onChange: (patch: Partial<Spacing>) => void
}

export function SpacingBox({ values, disabledSides = [], onChange }: SpacingBoxProps) {
  const isDisabled = (side: keyof Spacing) => disabledSides.includes(side)

  const fieldClass = (side: keyof Spacing) =>
    `${isDisabled(side) ? PANEL_INPUT_DISABLED : PANEL_INPUT} w-12 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`

  const handle = (side: keyof Spacing) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled(side)) return
    onChange({ [side]: clamp(Number(e.target.value), 0, 999) } as Partial<Spacing>)
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

/** Which margin sides are overridden to 'auto' by the current alignment. */
export function marginAutoSides(alignment: Alignment): Array<keyof Spacing> {
  if (alignment === 'center') return ['left', 'right']
  if (alignment === 'left') return ['right']
  return ['left']
}

/** Computes left/right margin CSS values given alignment + raw spacing. */
export function resolveHorizontalMargin(alignment: Alignment, margin: Spacing) {
  const marginLeft = alignment === 'center' || alignment === 'right' ? 'auto' : `${margin.left}px`
  const marginRight = alignment === 'center' || alignment === 'left' ? 'auto' : `${margin.right}px`
  return { marginLeft, marginRight }
}
