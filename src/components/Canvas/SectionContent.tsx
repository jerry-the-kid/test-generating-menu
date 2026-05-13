import { DragDropProvider } from '@dnd-kit/react'
import { Panel, Group, Separator } from 'react-resizable-panels'
import type { Layout } from 'react-resizable-panels'
import { useActivePaneId, useMenuActions, useSelectedSectionId } from '../../store/menuStore'
import { BlockRenderer } from './BlockRenderer'
import type { Section } from '../../store/types'
import { PANE_CONTAINER, PANE_CONTAINER_ACTIVE, PANE_EMPTY, cx } from './styles'

export function SectionContent({ section }: { section: Section }) {
  const { setPaneRatio, moveBlock, selectSection, setActivePaneId } = useMenuActions()
  const activePaneId = useActivePaneId()
  const selectedSectionId = useSelectedSectionId()

  if (section.panes.length === 1) {
    const pane = section.panes[0]
    const isActive = selectedSectionId === section.id && activePaneId === pane.id
    return (
      <DragDropProvider
        onDragEnd={(event) => {
          const { source } = event.operation
          if (source && 'index' in source) {
            moveBlock(String(source.id), section.id, pane.id, source.index as number)
          }
        }}
      >
        <div
          className={cx(PANE_CONTAINER, isActive && PANE_CONTAINER_ACTIVE)}
          onClick={(e) => {
            e.stopPropagation()
            selectSection(section.id)
            setActivePaneId(pane.id)
          }}
        >
          {pane.blocks.length === 0 ? (
            <div className={PANE_EMPTY}>Drop blocks here</div>
          ) : (
            pane.blocks.map((block, index) => (
              <BlockRenderer key={block.id} block={block} index={index} />
            ))
          )}
        </div>
      </DragDropProvider>
    )
  }

  // Multiple panes → resizable split
  return (
    <Group
      orientation="horizontal"
      onLayoutChanged={(layout: Layout) => {
        const sizes = Object.values(layout)
        const total = sizes.reduce((a: number, b: number) => a + b, 0)
        const ratios = sizes.map((s: number) => s / total)
        setPaneRatio(section.id, ratios)
      }}
    >
      {section.panes.map((pane, i) => {
        const isActive = selectedSectionId === section.id && activePaneId === pane.id
        return (
          <>
            {i > 0 && <Separator key={`sep-${pane.id}`} className="pane-resize-handle" />}
            <Panel key={pane.id} defaultSize={pane.ratio * 100} minSize={15}>
              <DragDropProvider
                onDragEnd={(event) => {
                  const { source } = event.operation
                  if (source && 'index' in source) {
                    moveBlock(String(source.id), section.id, pane.id, source.index as number)
                  }
                }}
              >
                <div
                  className={cx(PANE_CONTAINER, isActive && PANE_CONTAINER_ACTIVE)}
                  onClick={(e) => {
                    e.stopPropagation()
                    selectSection(section.id)
                    setActivePaneId(pane.id)
                  }}
                >
                  {pane.blocks.length === 0 ? (
                    <div className={PANE_EMPTY}>Drop blocks here</div>
                  ) : (
                    pane.blocks.map((block, index) => (
                      <BlockRenderer key={block.id} block={block} index={index} />
                    ))
                  )}
                </div>
              </DragDropProvider>
            </Panel>
          </>
        )
      })}
    </Group>
  )
}
