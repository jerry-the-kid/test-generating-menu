import { useMenuStore } from '../../store/menuStore'
import { findSectionInDoc } from '../../store/helpers'

export function SectionToolbar({ sectionId }: { sectionId: string }) {
  const deleteSection = useMenuStore(s => s.deleteSection)
  const moveSectionUp = useMenuStore(s => s.moveSectionUp)
  const moveSectionDown = useMenuStore(s => s.moveSectionDown)
  const doc = useMenuStore(s => s.doc)

  const result = findSectionInDoc(doc, sectionId)
  const isFirst = result ? result.sectionIndex === 0 : true
  const isLast = result ? result.sectionIndex >= result.area.sections.length - 1 : true

  return (
    <div className="section-toolbar">
      <button
        className="toolbar-btn"
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
        className="toolbar-btn"
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
        className="toolbar-btn danger"
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
