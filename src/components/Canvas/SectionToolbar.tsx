import { useDoc, useMenuActions } from '../../store/menuStore'
import { findSectionInDoc } from '../../store/helpers'
import {
  SECTION_TOOLBAR,
  SECTION_TOOLBAR_BTN,
  SECTION_TOOLBAR_BTN_DANGER,
} from './styles'

export function SectionToolbar({ sectionId }: { sectionId: string }) {
  const { deleteSection, moveSectionUp, moveSectionDown } = useMenuActions()
  const doc = useDoc()

  const result = findSectionInDoc(doc, sectionId)
  const isFirst = result ? result.sectionIndex === 0 : true
  const isLast = result ? result.sectionIndex >= result.area.sections.length - 1 : true

  return (
    <div className={SECTION_TOOLBAR}>
      <button
        className={SECTION_TOOLBAR_BTN}
        onClick={(e) => {
          e.stopPropagation()
          moveSectionUp(sectionId)
        }}
        disabled={isFirst}
        title="Move up"
      >
        ↑
      </button>
      <button
        className={SECTION_TOOLBAR_BTN}
        onClick={(e) => {
          e.stopPropagation()
          moveSectionDown(sectionId)
        }}
        disabled={isLast}
        title="Move down"
      >
        ↓
      </button>
      <button
        className={SECTION_TOOLBAR_BTN_DANGER}
        onClick={(e) => {
          e.stopPropagation()
          deleteSection(sectionId)
        }}
        title="Delete section"
      >
        Xóa
      </button>
    </div>
  )
}
