import { useMenuActions } from '../../store/menuStore'
import type { Area, SectionPreset } from '../../store/types'
import {
  AlignmentControl,
  GapControl,
  marginAutoSides,
  PANEL_INPUT,
  PANEL_LABEL,
  PANEL_SECTION_DIVIDER,
  SpacingBox,
  WidthControl,
} from './LayoutControls'

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

  const marginDisabled = marginAutoSides(area.alignment)

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
            <label className={PANEL_LABEL}>Height</label>
            <div className="flex items-center gap-1.5">
              <select
                className={PANEL_INPUT}
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
                  className={`${PANEL_INPUT} w-16 text-center`}
                />
              )}
            </div>
          </div>
        )}

        <div className={PANEL_SECTION_DIVIDER}>
          <WidthControl
            value={area.widthPercent}
            onChange={(v) => setAreaWidthPercent(area.id, v)}
          />
        </div>

        <AlignmentControl value={area.alignment} onChange={(a) => setAreaAlignment(area.id, a)} />

        <GapControl
          value={area.gap}
          onChange={(v) => setAreaGap(area.id, v)}
          label="Section gap"
          hint="px between sections"
        />

        <div className={`${PANEL_SECTION_DIVIDER} flex flex-col gap-1.5`}>
          <div className="flex items-center justify-between">
            <label className={PANEL_LABEL}>Margin (px)</label>
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

        <div className="flex flex-col gap-1.5">
          <label className={PANEL_LABEL}>Padding (px)</label>
          <SpacingBox values={area.padding} onChange={(patch) => setAreaPadding(area.id, patch)} />
        </div>

        <div className={`${PANEL_SECTION_DIVIDER} flex flex-col gap-1`}>
          <label className={PANEL_LABEL}>Add Section</label>
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
