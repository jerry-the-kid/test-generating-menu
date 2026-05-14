import { useSortable } from '@dnd-kit/react/sortable'
import type { CSSProperties } from 'react'
import { useActivePanelLevel, useMenuActions, useSelectedSectionId } from '../../store/menuStore'
import type { Section } from '../../store/types'
import { resolveHorizontalMargin } from '../PropertyPanel/LayoutControls'
import { SectionContent } from './SectionContent'
// import { SectionHeader } from './SectionHeader'
import {
  SECTION_FRAME,
  SECTION_FRAME_DRAGGING,
  SECTION_FRAME_LOCKED,
  SECTION_FRAME_SELECTED,
  cx,
} from './styles'

interface SortableSectionProps {
  section: Section
  index: number
}

export function SortableSection({ section, index }: SortableSectionProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: section.id,
    index,
    type: 'section',
    accept: ['section'],
    disabled: section.locked,
  })

  const { selectSection } = useMenuActions()
  const selectedSectionId = useSelectedSectionId()
  const activePanelLevel = useActivePanelLevel()
  const isSelected = activePanelLevel === 'section' && selectedSectionId === section.id

  const { marginLeft, marginRight } = resolveHorizontalMargin(section.alignment, section.margin)

  const style: CSSProperties = {
    width: `${section.widthPercent}%`,
    marginTop: `${section.margin.top}px`,
    marginBottom: `${section.margin.bottom}px`,
    marginLeft,
    marginRight,
    paddingTop: `${section.padding.top}px`,
    paddingRight: `${section.padding.right}px`,
    paddingBottom: `${section.padding.bottom}px`,
    paddingLeft: `${section.padding.left}px`,
  }

  // handleRef preserved for future drag-handle use
  void handleRef

  return (
    <div
      ref={ref}
      className={cx(
        SECTION_FRAME,
        isDragging && SECTION_FRAME_DRAGGING,
        section.locked && SECTION_FRAME_LOCKED,
        isSelected && SECTION_FRAME_SELECTED,
      )}
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        selectSection(section.id)
      }}
    >
      <SectionContent section={section} />
    </div>
  )
}
