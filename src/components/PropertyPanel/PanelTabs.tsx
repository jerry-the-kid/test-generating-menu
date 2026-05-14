import {
  useActivePanelLevel,
  useMenuActions,
  useSelectedAreaId,
  useSelectedBlockId,
  useSelectedSectionId,
} from '../../store/menuStore'
import type { PanelLevel } from '../../store/types'

const TABS: { level: PanelLevel; label: string }[] = [
  { level: 'area', label: 'Area' },
  { level: 'section', label: 'Section' },
  { level: 'block', label: 'Block' },
]

export function PanelTabs() {
  const areaId = useSelectedAreaId()
  const sectionId = useSelectedSectionId()
  const blockId = useSelectedBlockId()
  const active = useActivePanelLevel()
  const { setActivePanelLevel } = useMenuActions()

  const available: Record<PanelLevel, boolean> = {
    area: !!areaId,
    section: !!sectionId,
    block: !!blockId,
  }

  const visibleTabs = TABS.filter((t) => available[t.level])
  if (visibleTabs.length === 0) return null

  return (
    <div className="flex border-b border-slate-200 bg-white">
      {visibleTabs.map(({ level, label }) => {
        const isActive = active === level
        return (
          <button
            key={level}
            onClick={() => setActivePanelLevel(level)}
            className={
              'flex-1 py-2 text-xs font-medium cursor-pointer transition-colors duration-100 border-b-2 ' +
              (isActive
                ? 'border-blue-500 text-blue-600 bg-blue-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50')
            }
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
