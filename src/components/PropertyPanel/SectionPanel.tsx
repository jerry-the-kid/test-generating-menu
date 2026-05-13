import { useDoc, useMenuActions } from '../../store/menuStore'
import { findSectionInDoc } from '../../store/helpers'
import { formatSectionType } from '../Canvas/styles'
import type { Section } from '../../store/types'

const BTN =
  'px-2.5 py-1 border border-slate-200 rounded bg-white text-xs cursor-pointer text-slate-600 transition-all duration-100 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white'
const BTN_DANGER =
  'px-2.5 py-1 border border-slate-200 rounded bg-white text-xs cursor-pointer text-slate-600 transition-all duration-100 hover:border-red-500 hover:bg-red-50 hover:text-red-600'

export function SectionPanel({ section }: { section: Section }) {
  const doc = useDoc()
  const { moveSectionUp, moveSectionDown, deleteSection } = useMenuActions()

  const located = findSectionInDoc(doc, section.id)
  const isFirst = located ? located.sectionIndex === 0 : true
  const isLast = located ? located.sectionIndex >= located.area.sections.length - 1 : true

  return (
    <>
      <h3 className="text-sm font-semibold mb-1 text-slate-700">Section</h3>
      <p className="text-xs text-slate-400 mb-4 capitalize">{formatSectionType(section.type)}</p>

      <div className="flex flex-col gap-2">
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
      </div>
    </>
  )
}
