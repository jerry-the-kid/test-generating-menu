import type { CSSProperties } from 'react'
import { useActivePanelLevel, useMenuActions, useSelectedAreaId } from '../../store/menuStore'
import type { Area, Section } from '../../store/types'
import { SortableSection } from './SortableSection'
import {
  AREA_FRAME_BASE,
  AREA_FRAME_FIXED,
  AREA_FRAME_LIST,
  AREA_SELECTED,
  cx,
} from './styles'

interface AreaRendererProps {
  area: Area
  sectionIds: string[]
  sectionById: Map<string, Section>
}

export function AreaRenderer({ area, sectionIds, sectionById }: AreaRendererProps) {
  const { selectArea } = useMenuActions()
  const selectedAreaId = useSelectedAreaId()
  const activePanelLevel = useActivePanelLevel()
  const isSelected = activePanelLevel === 'area' && selectedAreaId === area.id

  const sections = sectionIds
    .map((id) => sectionById.get(id))
    .filter((s): s is Section => !!s)

  const { alignment, margin, padding, widthPercent, gap } = area
  const marginLeft = alignment === 'center' || alignment === 'right' ? 'auto' : `${margin.left}px`
  const marginRight = alignment === 'center' || alignment === 'left' ? 'auto' : `${margin.right}px`

  const style: CSSProperties = {
    width: `${widthPercent}%`,
    marginTop: `${margin.top}px`,
    marginBottom: `${margin.bottom}px`,
    marginLeft,
    marginRight,
    paddingTop: `${padding.top}px`,
    paddingRight: `${padding.right}px`,
    paddingBottom: `${padding.bottom}px`,
    paddingLeft: `${padding.left}px`,
    gap: `${gap}px`,
    ...(area.height !== 'auto' ? { height: `${area.height}px`, overflow: 'hidden' } : {}),
  }

  return (
    <div
      className={cx(
        AREA_FRAME_BASE,
        area.type === 'fixed' ? AREA_FRAME_FIXED : AREA_FRAME_LIST,
        isSelected && AREA_SELECTED,
      )}
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        selectArea(area.id)
      }}
    >
      <div className="flex items-center gap-1.5 px-2 py-0.5 absolute -top-3 left-2 bg-inherit z-[1]">
        <span
          className={cx(
            'text-[9px] px-1.5 py-px rounded-[3px] uppercase font-semibold tracking-[0.04em]',
            area.type === 'fixed'
              ? 'bg-amber-100 text-amber-900'
              : 'bg-blue-100 text-blue-900',
          )}
        >
          {area.type}
        </span>
        <span className="text-[11px] text-slate-500 font-medium">{area.name}</span>
      </div>
      <div className="flex flex-col flex-1 overflow-visible" style={{ gap: `${gap}px` }}>
        {sections.map((section, index) => (
          <SortableSection key={section.id} section={section} index={index} />
        ))}
        {sections.length === 0 && (
          <div className="flex items-center justify-center min-h-[50px] text-slate-300 text-xs">
            No sections — add one to this area
          </div>
        )}
      </div>
    </div>
  )
}
