import type { ReactNode } from 'react'
import {
  useActivePanelLevel,
  useSelectedArea,
  useSelectedBlock,
  useSelectedPane,
  useSelectedSection,
} from '../../store/menuStore'
import { AreaPanel } from './AreaPanel'
import { BlockPanel } from './BlockPanel'
import { EmptyState } from './EmptyState'
import { PanelTabs } from './PanelTabs'
import { PanePanel } from './PanePanel'
import { SectionPanel } from './SectionPanel'

export function PropertyPanel() {
  const block = useSelectedBlock()
  const pane = useSelectedPane()
  const section = useSelectedSection()
  const area = useSelectedArea()
  const active = useActivePanelLevel()

  const paneCount = section?.panes.length ?? 0
  const paneIndex = pane && section ? section.panes.findIndex((p) => p.id === pane.id) : -1

  let content: ReactNode
  if (!area && !section && !block && !pane) content = <EmptyState />
  else if (active === 'block' && block) content = <BlockPanel block={block} />
  else if (active === 'pane' && pane && section)
    content = (
      <PanePanel pane={pane} sectionId={section.id} paneIndex={paneIndex} paneCount={paneCount} />
    )
  else if (active === 'section' && section) content = <SectionPanel section={section} />
  else if (active === 'area' && area) content = <AreaPanel area={area} />
  else content = <EmptyState />

  return (
    <div className="h-full w-72 flex flex-col bg-slate-50 border-l border-slate-200">
      <PanelTabs />
      <div className="flex-1 overflow-y-auto p-3">{content}</div>
    </div>
  )
}
