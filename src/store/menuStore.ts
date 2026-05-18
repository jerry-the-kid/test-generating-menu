import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { temporal } from 'zundo'
import type { Alignment, Area, AreaType, Block, BlockType, ContentAlignment, MenuDoc, MenuItem, MenuTextStyle, Page, PageConfig, PageSizePreset, Pane, PanelLevel, Section, SectionPreset, Spacing } from './types'
import { createArea, createBlock, createEmptyDoc, createId, createSection, findBlockAncestors, findBlockInDoc, findSectionInDoc, MM_TO_PX, resolvePageDimensions } from './helpers'

interface MenuStoreState {
  doc: MenuDoc

  // UI state (not tracked by undo)
  selectedBlockId: string | null
  selectedSectionId: string | null
  selectedAreaId: string | null
  activePaneId: string | null
  activePanelLevel: PanelLevel | null

  // Runtime measurements (not tracked by undo)
  sectionMeasuredHeights: Record<string, number>
  listAreaResolvedHeight: number | null

  actions: MenuStoreActions
}

interface MenuStoreActions {
  // Area
  addArea: (name: string, type: AreaType, height?: 'auto' | number) => void
  deleteArea: (areaId: string) => void
  moveAreaUp: (areaId: string) => void
  moveAreaDown: (areaId: string) => void
  setAreaHeight: (areaId: string, height: 'auto' | number) => void
  setAreaGap: (areaId: string, gap: number) => void
  setAreaWidthPercent: (areaId: string, percent: number) => void
  setAreaAlignment: (areaId: string, alignment: Alignment) => void
  setAreaMargin: (areaId: string, patch: Partial<Spacing>) => void
  setAreaPadding: (areaId: string, patch: Partial<Spacing>) => void
  selectArea: (areaId: string | null) => void

  // Section
  addSection: (areaId: string, preset: SectionPreset) => void
  moveSection: (sectionId: string, toIndex: number) => void
  moveSectionUp: (sectionId: string) => void
  moveSectionDown: (sectionId: string) => void
  deleteSection: (sectionId: string) => void
  setPaneRatio: (sectionId: string, ratios: number[]) => void
  setSectionWidthPercent: (sectionId: string, percent: number) => void
  setSectionHeight: (sectionId: string, value: 'min-content' | number) => void
  setSectionGap: (sectionId: string, gap: number) => void
  setSectionAlignment: (sectionId: string, alignment: Alignment) => void
  setSectionMargin: (sectionId: string, patch: Partial<Spacing>) => void

  // Pane
  setPaneGap: (sectionId: string, paneId: string, gap: number) => void
  setPaneContentAlignment: (sectionId: string, paneId: string, value: ContentAlignment) => void
  setPanePadding: (sectionId: string, paneId: string, patch: Partial<Spacing>) => void
  selectPane: (sectionId: string, paneId: string) => void

  // Block
  addBlock: (sectionId: string, paneId: string, type: BlockType) => void
  updateBlock: (blockId: string, patch: Partial<Block>) => void
  deleteBlock: (blockId: string) => void
  moveBlock: (blockId: string, toSectionId: string, toPaneId: string, toIndex: number) => void
  setBlockGap: (blockId: string, gap: number) => void
  setBlockMargin: (blockId: string, patch: Partial<Spacing>) => void
  setBlockPadding: (blockId: string, patch: Partial<Spacing>) => void

  // Menu items
  addMenuItem: (blockId: string) => void
  updateMenuItem: (blockId: string, idx: number, patch: Partial<MenuItem>) => void
  removeMenuItem: (blockId: string, idx: number) => void

  // Menu style (global)
  setMenuStyle: (patch: { title?: Partial<MenuTextStyle>; item?: Partial<MenuTextStyle> }) => void

  // Selection
  selectBlock: (blockId: string | null) => void
  selectSection: (sectionId: string | null) => void
  setActivePaneId: (paneId: string | null) => void
  setActivePanelLevel: (level: PanelLevel | null) => void

  // Page config
  setPagePreset: (preset: PageSizePreset) => void
  setPagePadding: (patch: Partial<PageConfig['padding']>) => void
  setPageGap: (gap: number) => void
  recalculatePages: (sectionHeights: Map<string, number>) => void
  setSectionMeasuredHeights: (heights: Map<string, number>) => void

  // Typography
  setGlobalScaleFactor: (factor: number) => void
  setGlobalLineHeight: (height: number) => void

  // History
  undo: () => void
  redo: () => void
}

export const useMenuStore = create<MenuStoreState>()(
  temporal(
    immer((set) => ({
      doc: createEmptyDoc(),
      selectedBlockId: null,
      selectedSectionId: null,
      selectedAreaId: null,
      activePaneId: null,
      activePanelLevel: null,
      sectionMeasuredHeights: {},
      listAreaResolvedHeight: null,

      actions: {
        addArea: (name, type, height = 'auto') => set((state) => {
          const area = createArea(name, type, height)
          state.doc.areas.push(area)
          state.selectedAreaId = area.id
          state.selectedSectionId = null
          state.selectedBlockId = null
          state.activePanelLevel = 'area'
        }),

        deleteArea: (areaId) => set((state) => {
          state.doc.areas = state.doc.areas.filter((a) => a.id !== areaId)
          if (state.selectedAreaId === areaId) {
            state.selectedAreaId = null
            state.selectedSectionId = null
            state.selectedBlockId = null
            state.activePaneId = null
            state.activePanelLevel = null
          }
        }),

        moveAreaUp: (areaId) => set((state) => {
          const areas = state.doc.areas
          const idx = areas.findIndex((a) => a.id === areaId)
          if (idx <= 0) return
          const [area] = areas.splice(idx, 1)
          areas.splice(idx - 1, 0, area)
        }),

        moveAreaDown: (areaId) => set((state) => {
          const areas = state.doc.areas
          const idx = areas.findIndex((a) => a.id === areaId)
          if (idx === -1 || idx >= areas.length - 1) return
          const [area] = areas.splice(idx, 1)
          areas.splice(idx + 1, 0, area)
        }),

        setAreaHeight: (areaId, height) => set((state) => {
          const area = state.doc.areas.find((a) => a.id === areaId)
          if (area) area.height = height
        }),

        setAreaGap: (areaId, gap) => set((state) => {
          const area = state.doc.areas.find((a) => a.id === areaId)
          if (area) area.gap = Math.max(0, gap)
        }),

        setAreaWidthPercent: (areaId, percent) => set((state) => {
          const area = state.doc.areas.find((a) => a.id === areaId)
          if (area) area.widthPercent = Math.max(10, Math.min(100, percent))
        }),

        setAreaAlignment: (areaId, alignment) => set((state) => {
          const area = state.doc.areas.find((a) => a.id === areaId)
          if (area) area.alignment = alignment
        }),

        setAreaMargin: (areaId, patch) => set((state) => {
          const area = state.doc.areas.find((a) => a.id === areaId)
          if (area) Object.assign(area.margin, patch)
        }),

        setAreaPadding: (areaId, patch) => set((state) => {
          const area = state.doc.areas.find((a) => a.id === areaId)
          if (area) Object.assign(area.padding, patch)
        }),

        selectArea: (areaId) => set((state) => {
          state.selectedAreaId = areaId
          state.selectedSectionId = null
          state.selectedBlockId = null
          state.activePanelLevel = areaId ? 'area' : null
        }),

        addSection: (areaId, preset) => set((state) => {
          const area = state.doc.areas.find((a) => a.id === areaId)
          if (!area) return
          area.sections.push(createSection(preset))
        }),

        moveSection: (sectionId, toIndex) => set((state) => {
          const result = findSectionInDoc(state.doc, sectionId)
          if (!result) return
          const { area, sectionIndex } = result
          if (sectionIndex === -1) return
          const [section] = area.sections.splice(sectionIndex, 1)
          area.sections.splice(toIndex, 0, section)
        }),

        moveSectionUp: (sectionId) => set((state) => {
          const result = findSectionInDoc(state.doc, sectionId)
          if (!result) return
          const { area, sectionIndex } = result
          if (sectionIndex <= 0) return
          const [section] = area.sections.splice(sectionIndex, 1)
          area.sections.splice(sectionIndex - 1, 0, section)
        }),

        moveSectionDown: (sectionId) => set((state) => {
          const result = findSectionInDoc(state.doc, sectionId)
          if (!result) return
          const { area, sectionIndex } = result
          if (sectionIndex >= area.sections.length - 1) return
          const [section] = area.sections.splice(sectionIndex, 1)
          area.sections.splice(sectionIndex + 1, 0, section)
        }),

        deleteSection: (sectionId) => set((state) => {
          const result = findSectionInDoc(state.doc, sectionId)
          if (!result) return
          result.area.sections.splice(result.sectionIndex, 1)
          if (state.selectedSectionId === sectionId) {
            state.selectedSectionId = null
            state.selectedBlockId = null
            state.activePaneId = null
            if (
              state.activePanelLevel === 'section' ||
              state.activePanelLevel === 'pane' ||
              state.activePanelLevel === 'block'
            ) {
              state.activePanelLevel = state.selectedAreaId ? 'area' : null
            }
          }
        }),

        setPaneRatio: (sectionId, ratios) => set((state) => {
          const result = findSectionInDoc(state.doc, sectionId)
          if (!result) return
          result.section.panes.forEach((pane, i) => {
            if (ratios[i] !== undefined) {
              pane.ratio = ratios[i]
            }
          })
        }),

        setSectionWidthPercent: (sectionId, percent) => set((state) => {
          const result = findSectionInDoc(state.doc, sectionId)
          if (result) result.section.widthPercent = Math.max(10, Math.min(100, percent))
        }),

        setSectionHeight: (sectionId, value) => set((state) => {
          const result = findSectionInDoc(state.doc, sectionId)
          if (!result) return
          result.section.height = value === 'min-content'
            ? 'min-content'
            : Math.max(5, Math.min(100, value))
        }),

        setSectionGap: (sectionId, gap) => set((state) => {
          const result = findSectionInDoc(state.doc, sectionId)
          if (result) result.section.gap = Math.max(0, gap)
        }),

        setSectionAlignment: (sectionId, alignment) => set((state) => {
          const result = findSectionInDoc(state.doc, sectionId)
          if (result) result.section.alignment = alignment
        }),

        setSectionMargin: (sectionId, patch) => set((state) => {
          const result = findSectionInDoc(state.doc, sectionId)
          if (result) Object.assign(result.section.margin, patch)
        }),

        setPaneGap: (sectionId, paneId, gap) => set((state) => {
          const result = findSectionInDoc(state.doc, sectionId)
          const pane = result?.section.panes.find((p) => p.id === paneId)
          if (pane) pane.gap = Math.max(0, gap)
        }),

        setPaneContentAlignment: (sectionId, paneId, value) => set((state) => {
          const result = findSectionInDoc(state.doc, sectionId)
          const pane = result?.section.panes.find((p) => p.id === paneId)
          if (pane) pane.contentAlignment = value
        }),

        setPanePadding: (sectionId, paneId, patch) => set((state) => {
          const result = findSectionInDoc(state.doc, sectionId)
          const pane = result?.section.panes.find((p) => p.id === paneId)
          if (pane) Object.assign(pane.padding, patch)
        }),

        selectPane: (sectionId, paneId) => set((state) => {
          const result = findSectionInDoc(state.doc, sectionId)
          if (!result) return
          state.selectedAreaId = result.area.id
          state.selectedSectionId = sectionId
          state.selectedBlockId = null
          state.activePaneId = paneId
          state.activePanelLevel = 'pane'
        }),

        addBlock: (sectionId, paneId, type) => set((state) => {
          const result = findSectionInDoc(state.doc, sectionId)
          if (!result) return
          const pane = result.section.panes.find((p) => p.id === paneId)
          if (!pane) return
          const block = createBlock(type)
          pane.blocks.push(block)
          state.selectedBlockId = block.id
        }),

        updateBlock: (blockId, patch) => set((state) => {
          const result = findBlockInDoc(state.doc, blockId)
          if (result) {
            Object.assign(result.block, patch)
          }
        }),

        deleteBlock: (blockId) => set((state) => {
          const result = findBlockInDoc(state.doc, blockId)
          if (!result) return
          result.pane.blocks.splice(result.blockIndex, 1)
          if (state.selectedBlockId === blockId) {
            state.selectedBlockId = null
            if (state.activePanelLevel === 'block') {
              state.activePanelLevel = state.activePaneId
                ? 'pane'
                : state.selectedSectionId ? 'section' : state.selectedAreaId ? 'area' : null
            }
          }
        }),

        setBlockGap: (blockId, gap) => set((state) => {
          const result = findBlockInDoc(state.doc, blockId)
          if (result) result.block.gap = Math.max(0, gap)
        }),

        setBlockMargin: (blockId, patch) => set((state) => {
          const result = findBlockInDoc(state.doc, blockId)
          if (result) Object.assign(result.block.margin, patch)
        }),

        setBlockPadding: (blockId, patch) => set((state) => {
          const result = findBlockInDoc(state.doc, blockId)
          if (result) Object.assign(result.block.padding, patch)
        }),

        addMenuItem: (blockId) => set((state) => {
          const result = findBlockInDoc(state.doc, blockId)
          if (!result || result.block.type !== 'menu') return
          result.block.items.push({ name: '', price: '', unit: '' })
        }),

        updateMenuItem: (blockId, idx, patch) => set((state) => {
          const result = findBlockInDoc(state.doc, blockId)
          if (!result || result.block.type !== 'menu') return
          const item = result.block.items[idx]
          if (item) Object.assign(item, patch)
        }),

        removeMenuItem: (blockId, idx) => set((state) => {
          const result = findBlockInDoc(state.doc, blockId)
          if (!result || result.block.type !== 'menu') return
          result.block.items.splice(idx, 1)
        }),

        setMenuStyle: (patch) => set((state) => {
          if (patch.title) Object.assign(state.doc.menuStyle.title, patch.title)
          if (patch.item) Object.assign(state.doc.menuStyle.item, patch.item)
        }),

        moveBlock: (blockId, toSectionId, toPaneId, toIndex) => set((state) => {
          const fromResult = findBlockInDoc(state.doc, blockId)
          if (!fromResult) return
          const [movedBlock] = fromResult.pane.blocks.splice(fromResult.blockIndex, 1)

          const targetResult = findSectionInDoc(state.doc, toSectionId)
          if (!targetResult) return
          const targetPane = targetResult.section.panes.find((p) => p.id === toPaneId)
          if (!targetPane) return
          targetPane.blocks.splice(toIndex, 0, movedBlock)
        }),

        selectBlock: (blockId) => set((state) => {
          if (!blockId) {
            state.selectedBlockId = null
            if (state.activePanelLevel === 'block') {
              state.activePanelLevel = state.activePaneId
                ? 'pane'
                : state.selectedSectionId ? 'section' : state.selectedAreaId ? 'area' : null
            }
            return
          }
          const ancestors = findBlockAncestors(state.doc, blockId)
          if (!ancestors) return
          state.selectedBlockId = blockId
          state.selectedSectionId = ancestors.section.id
          state.selectedAreaId = ancestors.area.id
          state.activePaneId = ancestors.pane.id
          state.activePanelLevel = 'block'
        }),

        selectSection: (sectionId) => set((state) => {
          if (!sectionId) {
            state.selectedSectionId = null
            state.selectedBlockId = null
            state.activePaneId = null
            if (state.activePanelLevel === 'section' || state.activePanelLevel === 'pane' || state.activePanelLevel === 'block') {
              state.activePanelLevel = state.selectedAreaId ? 'area' : null
            }
            return
          }
          const result = findSectionInDoc(state.doc, sectionId)
          if (!result) return
          state.selectedSectionId = sectionId
          state.selectedAreaId = result.area.id
          state.selectedBlockId = null
          state.activePaneId = null
          state.activePanelLevel = 'section'
        }),

        setActivePaneId: (paneId) => set((state) => {
          state.activePaneId = paneId
        }),

        setActivePanelLevel: (level) => set((state) => {
          state.activePanelLevel = level
        }),

        setPagePreset: (preset) => set((state) => {
          state.doc.page.preset = preset
          state.doc.pages = []
        }),

        setPagePadding: (patch) => set((state) => {
          Object.assign(state.doc.page.padding, patch)
          state.doc.pages = []
        }),

        setPageGap: (gap) => set((state) => {
          state.doc.page.gap = gap
          state.doc.pages = []
        }),

        recalculatePages: (sectionHeights) => set((state) => {
          const { doc } = state
          const dims = resolvePageDimensions(doc.page)
          const paddingTopPx = doc.page.padding.top * MM_TO_PX
          const paddingBottomPx = doc.page.padding.bottom * MM_TO_PX
          const usableHeight = dims.heightPx - paddingTopPx - paddingBottomPx
          const pageGapPx = doc.page.gap

          let fixedAreasHeight = 0
          for (const area of doc.areas) {
            if (area.type === 'fixed') {
              if (area.height === 'auto') {
                let areaH = area.padding.top + area.padding.bottom
                let sectionsAccum = 0
                for (const section of area.sections) {
                  const h = sectionHeights.get(section.id) ?? 0
                  sectionsAccum += (sectionsAccum > 0 ? h + area.gap : h)
                }
                areaH += sectionsAccum
                fixedAreasHeight += (fixedAreasHeight > 0 ? areaH + pageGapPx : areaH)
              } else {
                fixedAreasHeight += (fixedAreasHeight > 0 ? area.height + pageGapPx : area.height)
              }
            }
          }

          const listAreaAvailableHeight = usableHeight - fixedAreasHeight - (fixedAreasHeight > 0 ? pageGapPx : 0)
          const listArea = doc.areas.find((a) => a.type === 'list')

          if (!listArea) {
            const page: Page = {
              id: createId(),
              index: 0,
              areaContents: doc.areas.map((area) => ({
                areaId: area.id,
                sectionIds: area.sections.map((s) => s.id),
              })),
            }
            doc.pages = [page]
            return
          }

          const listAreaOuterHeight = listArea.height === 'auto'
            ? listAreaAvailableHeight
            : listArea.height
          const listContentHeight = listAreaOuterHeight - listArea.padding.top - listArea.padding.bottom

          state.listAreaResolvedHeight = listContentHeight

          const listSectionGroups: string[][] = []
          let currentGroup: string[] = []
          let currentHeight = 0

          for (const section of listArea.sections) {
            const h = typeof section.height === 'number'
              ? listContentHeight * (section.height / 100)
              : (sectionHeights.get(section.id) ?? 0)
            const needed = currentHeight > 0 ? h + listArea.gap : h

            if (currentHeight + needed > listContentHeight && currentGroup.length > 0) {
              listSectionGroups.push(currentGroup)
              currentGroup = []
              currentHeight = 0
            }

            currentGroup.push(section.id)
            currentHeight += (currentHeight > 0 ? h + listArea.gap : h)
          }
          if (currentGroup.length > 0) listSectionGroups.push(currentGroup)
          if (listSectionGroups.length === 0) listSectionGroups.push([])

          doc.pages = listSectionGroups.map((listSectionIds, idx) => ({
            id: createId(),
            index: idx,
            areaContents: doc.areas.map((area) => ({
              areaId: area.id,
              sectionIds: area.id === listArea.id
                ? listSectionIds
                : area.sections.map((s) => s.id),
            })),
          }))
        }),

        setSectionMeasuredHeights: (heights) => set((state) => {
          state.sectionMeasuredHeights = Object.fromEntries(heights)
        }),

        setGlobalScaleFactor: (factor) => set((state) => {
          state.doc.typography.scaleFactor = factor
        }),

        setGlobalLineHeight: (height) => set((state) => {
          state.doc.typography.lineHeight = height
        }),

        undo: () => useMenuStore.temporal.getState().undo(),
        redo: () => useMenuStore.temporal.getState().redo(),
      },
    })),
    {
      // Exclude UI state and actions from undo history
      partialize: (state) => {
        const { doc } = state
        return { doc } as MenuStoreState
      },
    },
  ),
)

// ─── State selectors ───────────────────────────────────────────────

export const useDoc = () => useMenuStore((s) => s.doc)
export const usePages = () => useMenuStore((s) => s.doc.pages)
export const useTypography = () => useMenuStore((s) => s.doc.typography)
export const useMenuStyle = () => useMenuStore((s) => s.doc.menuStyle)
export const usePageConfig = () => useMenuStore((s) => s.doc.page)

export const useSelectedBlockId = () => useMenuStore((s) => s.selectedBlockId)
export const useSelectedSectionId = () => useMenuStore((s) => s.selectedSectionId)
export const useSelectedAreaId = () => useMenuStore((s) => s.selectedAreaId)
export const useActivePaneId = () => useMenuStore((s) => s.activePaneId)
export const useActivePanelLevel = () => useMenuStore((s) => s.activePanelLevel)

export const useSectionMeasuredHeight = (id: string) =>
  useMenuStore((s) => s.sectionMeasuredHeights[id])
export const useListAreaResolvedHeight = () =>
  useMenuStore((s) => s.listAreaResolvedHeight)

export const useSelectedBlock = (): Block | null =>
  useMenuStore((s) => {
    if (!s.selectedBlockId) return null
    return findBlockInDoc(s.doc, s.selectedBlockId)?.block ?? null
  })

export const useSelectedArea = (): Area | null =>
  useMenuStore((s) => {
    if (!s.selectedAreaId) return null
    return s.doc.areas.find((a) => a.id === s.selectedAreaId) ?? null
  })

export const useSelectedSection = (): Section | null =>
  useMenuStore((s) => {
    if (!s.selectedSectionId) return null
    return findSectionInDoc(s.doc, s.selectedSectionId)?.section ?? null
  })

export const useSelectedPane = (): Pane | null =>
  useMenuStore((s) => {
    if (!s.selectedSectionId || !s.activePaneId) return null
    const section = findSectionInDoc(s.doc, s.selectedSectionId)?.section
    return section?.panes.find((p) => p.id === s.activePaneId) ?? null
  })

export const useMenuActions = () => useMenuStore((s) => s.actions)
