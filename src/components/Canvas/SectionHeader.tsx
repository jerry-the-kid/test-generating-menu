import type { Ref } from 'react'
import type { Section } from '../../store/types'
import {
  DRAG_HANDLE,
  LOCK_BADGE,
  SECTION_HEADER,
  SECTION_TYPE_LABEL,
  formatSectionType,
} from './styles'

interface SectionHeaderProps {
  section: Section
  handleRef?: Ref<HTMLDivElement>
}

export function SectionHeader({ section, handleRef }: SectionHeaderProps) {
  return (
    <div className={SECTION_HEADER}>
      {handleRef && !section.locked && (
        <div ref={handleRef} className={DRAG_HANDLE} title="Drag to reorder">
          ⠿
        </div>
      )}
      {section.locked && (
        <div className={LOCK_BADGE} title="Locked">
          🔒
        </div>
      )}
      <span className={SECTION_TYPE_LABEL}>{formatSectionType(section.type)}</span>
    </div>
  )
}
