import { useDoc, useListAreaResolvedHeight, useMenuActions, useSectionMeasuredHeight } from '../../store/menuStore'
import { findSectionInDoc } from '../../store/helpers'
import { formatSectionType } from '../Canvas/styles'
import type { Section } from '../../store/types'
import {
  AlignmentControl,
  ContentAlignmentControl,
  GapControl,
  HeightControl,
  marginAutoSides,
  PANEL_LABEL,
  PANEL_SECTION_DIVIDER,
  SpacingBox,
  WidthControl,
} from './LayoutControls'

const BTN =
  'px-2.5 py-1 border border-slate-200 rounded bg-white text-xs cursor-pointer text-slate-600 transition-all duration-100 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white'
const BTN_DANGER =
  'px-2.5 py-1 border border-slate-200 rounded bg-white text-xs cursor-pointer text-slate-600 transition-all duration-100 hover:border-red-500 hover:bg-red-50 hover:text-red-600'

export function SectionPanel({ section }: { section: Section }) {
  const doc = useDoc()
  const {
    moveSectionUp,
    moveSectionDown,
    deleteSection,
    setSectionWidthPercent,
    setSectionHeight,
    setSectionGap,
    setSectionAlignment,
    setSectionContentAlignment,
    setSectionMargin,
    setSectionPadding,
  } = useMenuActions()

  const located = findSectionInDoc(doc, section.id)
  const isFirst = located ? located.sectionIndex === 0 : true
  const isLast = located ? located.sectionIndex >= located.area.sections.length - 1 : true
  const isListArea = located?.area.type === 'list'

  const measuredHeight = useSectionMeasuredHeight(section.id)
  const listAreaResolvedHeight = useListAreaResolvedHeight()
  const uncheckInitialPercent = (() => {
    if (!measuredHeight || !listAreaResolvedHeight || listAreaResolvedHeight <= 0) return 10
    const raw = (measuredHeight / listAreaResolvedHeight) * 100
    const rounded = Math.round(raw / 5) * 5
    return Math.min(100, Math.max(5, rounded))
  })()

  const marginDisabled = marginAutoSides(section.alignment)

  return (
    <>
      <h3 className="text-sm font-semibold mb-1 text-slate-700">Section</h3>
      <p className="text-xs text-slate-400 mb-4 capitalize">{formatSectionType(section.type)}</p>

      <div className="flex flex-col gap-3">
        <div className="flex gap-1.5">
          <button
            className={BTN}
            onClick={() => moveSectionUp(section.id)}
            disabled={isFirst || section.locked}
            title="Move up"
          >
            ↑ Up
          </button>
          <button
            className={BTN}
            onClick={() => moveSectionDown(section.id)}
            disabled={isLast || section.locked}
            title="Move down"
          >
            ↓ Down
          </button>
        </div>
        <button
          className={BTN_DANGER}
          onClick={() => deleteSection(section.id)}
          disabled={section.locked}
          title="Delete section"
        >
          Delete section
        </button>

        <div className={PANEL_SECTION_DIVIDER}>
          <WidthControl
            value={section.widthPercent}
            onChange={(v) => setSectionWidthPercent(section.id, v)}
          />
        </div>

        {isListArea && (
          <div className={PANEL_SECTION_DIVIDER}>
            <HeightControl
              value={section.height}
              onChange={(v) => setSectionHeight(section.id, v)}
              uncheckInitialPercent={uncheckInitialPercent}
            />
          </div>
        )}

        <AlignmentControl
          value={section.alignment}
          onChange={(a) => setSectionAlignment(section.id, a)}
        />

        <ContentAlignmentControl
          value={section.contentAlignment}
          onChange={(v) => setSectionContentAlignment(section.id, v)}
          hint={section.height === 'min-content' ? 'applies when section has fixed height' : undefined}
        />

        <GapControl
          value={section.gap}
          onChange={(v) => setSectionGap(section.id, v)}
          label="Block gap"
          hint="px between blocks & columns"
        />

        <div className={`${PANEL_SECTION_DIVIDER} flex flex-col gap-1.5`}>
          <div className="flex items-center justify-between">
            <label className={PANEL_LABEL}>Margin (px)</label>
            {marginDisabled.length > 0 && (
              <span className="text-[10px] text-slate-400 italic">
                {section.alignment === 'center' ? 'L/R: auto' : `${marginDisabled[0]}: auto`}
              </span>
            )}
          </div>
          <SpacingBox
            values={section.margin}
            disabledSides={marginDisabled}
            onChange={(patch) => setSectionMargin(section.id, patch)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={PANEL_LABEL}>Padding (px)</label>
          <SpacingBox
            values={section.padding}
            onChange={(patch) => setSectionPadding(section.id, patch)}
          />
        </div>
      </div>
    </>
  )
}
