import type { ReactNode } from 'react'
import {
  useSelectedArea,
  useSelectedBlock,
  useSelectedSection,
} from '../../store/menuStore'
import { AreaPanel } from './AreaPanel'
import { BlockPanel } from './BlockPanel'
import { EmptyState } from './EmptyState'
import { SectionPanel } from './SectionPanel'

export function PropertyPanel() {
  const block = useSelectedBlock()
  const section = useSelectedSection()
  const area = useSelectedArea()

  let content: ReactNode
  if (block) content = <BlockPanel block={block} />
  else if (section) content = <SectionPanel section={section} />
  else if (area) content = <AreaPanel area={area} />
  else content = <EmptyState />

  return (
    <div className="h-full w-72 overflow-y-auto p-3 bg-slate-50 border-l border-slate-200">
      {content}
    </div>
  )
}
