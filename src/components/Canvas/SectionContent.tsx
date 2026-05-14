import { DragDropProvider } from '@dnd-kit/react'
import type { CSSProperties } from 'react'
import { Panel, Group, Separator } from 'react-resizable-panels'
import type { Layout } from 'react-resizable-panels'
import { useActivePaneId, useMenuActions, useSelectedSectionId } from '../../store/menuStore'
import { BlockRenderer } from './BlockRenderer'
import type { Pane, Section } from '../../store/types'
import { PANE_CONTAINER, PANE_CONTAINER_ACTIVE, PANE_EMPTY, cx } from './styles'

const justifyMap = { start: 'flex-start', center: 'center', end: 'flex-end' } as const

function buildPaneStyle(pane: Pane): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: `${pane.gap}px`,
    justifyContent: justifyMap[pane.contentAlignment],
    paddingTop: `${pane.padding.top}px`,
    paddingRight: `${pane.padding.right}px`,
    paddingBottom: `${pane.padding.bottom}px`,
    paddingLeft: `${pane.padding.left}px`,
    height: '100%',
  }
}

export function SectionContent({ section }: Readonly<{ section: Section }>) {
  const { setPaneRatio, moveBlock, selectPane } = useMenuActions()
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
          style={buildPaneStyle(pane)}
          onClick={(e) => {
            e.stopPropagation()
            selectPane(section.id, pane.id)
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
            {i > 0 && (
              <Separator
                key={`sep-${pane.id}`}
                className="pane-resize-handle"
                style={{ width: `${section.gap}px` }}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  e.nativeEvent.stopPropagation()
                }}
              />
            )}
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
                  style={buildPaneStyle(pane)}
                  onClick={(e) => {
                    e.stopPropagation()
                    selectPane(section.id, pane.id)
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
