import { useSortable } from '@dnd-kit/react/sortable'
import { useMenuActions, useSelectedSectionId } from '../../store/menuStore'
import type { Section } from '../../store/types'
import { SectionContent } from './SectionContent'
import { SectionHeader } from './SectionHeader'
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
  const isSelected = selectedSectionId === section.id

  return (
    <div
      ref={ref}
      className={cx(
        SECTION_FRAME,
        isDragging && SECTION_FRAME_DRAGGING,
        section.locked && SECTION_FRAME_LOCKED,
        isSelected && SECTION_FRAME_SELECTED,
      )}
      style={{ width: '100%' }}
      onClick={(e) => {
        e.stopPropagation()
        selectSection(section.id)
      }}
    >
      <SectionHeader section={section} handleRef={handleRef} />
      <SectionContent section={section} />
    </div>
  )
}
