import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { temporal } from 'zundo'
import type { AreaType, Block, BlockType, MenuDoc, Page, PageConfig, PageSizePreset, SectionPreset } from './types'
import { createArea, createBlock, createEmptyDoc, createId, createSection, findBlockInDoc, findSectionInDoc, MM_TO_PX, resolvePageDimensions } from './helpers'

interface MenuStoreState {
  doc: MenuDoc

  // UI state (not tracked by undo)
  selectedBlockId: string | null
  selectedSectionId: string | null
  selectedAreaId: string | null
  activePaneId: string | null
}

interface MenuStoreActions {
  // Area actions
  addArea: (name: string, type: AreaType, height?: 'auto' | number) => void
  deleteArea: (areaId: string) => void
  moveAreaUp: (areaId: string) => void
  moveAreaDown: (areaId: string) => void
  setAreaHeight: (areaId: string, height: 'auto' | number) => void
  setAreaName: (areaId: string, name: string) => void
  selectArea: (areaId: string | null) => void

  // Section actions
  addSection: (areaId: string, preset: SectionPreset) => void
  moveSection: (sectionId: string, toIndex: number) => void
  moveSectionUp: (sectionId: string) => void
  moveSectionDown: (sectionId: string) => void
  deleteSection: (sectionId: string) => void
  setPaneRatio: (sectionId: string, ratios: number[]) => void

  // Block actions
  addBlock: (sectionId: string, paneId: string, type: BlockType) => void
  updateBlock: (blockId: string, patch: Partial<Block>) => void
  deleteBlock: (blockId: string) => void
  moveBlock: (blockId: string, toSectionId: string, toPaneId: string, toIndex: number) => void

  // Selection
  selectBlock: (blockId: string | null) => void
  selectSection: (sectionId: string | null) => void
  setActivePaneId: (paneId: string | null) => void

  // Grid
  setGridCols: (cols: 1 | 2 | 3 | 4) => void
  setGridGap: (gap: number) => void

  // Page config
  setPagePreset: (preset: PageSizePreset) => void
  setPagePadding: (patch: Partial<PageConfig['padding']>) => void
  recalculatePages: (sectionHeights: Map<string, number>) => void

  // Typography
  setGlobalScaleFactor: (factor: number) => void
  setGlobalLineHeight: (height: number) => void
}

export type MenuStore = MenuStoreState & MenuStoreActions

export const useMenuStore = create<MenuStore>()(
  temporal(
    immer((set) => ({
      doc: createEmptyDoc(),
      selectedBlockId: null,
      selectedSectionId: null,
      selectedAreaId: null,
      activePaneId: null,

      // ─── Area actions ───────────────────────────────

      addArea: (name, type, height = 'auto') => set((state) => {
        const area = createArea(name, type, height)
        state.doc.areas.push(area)
        state.selectedAreaId = area.id
      }),

      deleteArea: (areaId) => set((state) => {
        state.doc.areas = state.doc.areas.filter(a => a.id !== areaId)
        if (state.selectedAreaId === areaId) {
          state.selectedAreaId = null
        }
      }),

      moveAreaUp: (areaId) => set((state) => {
        const areas = state.doc.areas
        const idx = areas.findIndex(a => a.id === areaId)
        if (idx <= 0) return
        const [area] = areas.splice(idx, 1)
        areas.splice(idx - 1, 0, area)
      }),

      moveAreaDown: (areaId) => set((state) => {
        const areas = state.doc.areas
        const idx = areas.findIndex(a => a.id === areaId)
        if (idx === -1 || idx >= areas.length - 1) return
        const [area] = areas.splice(idx, 1)
        areas.splice(idx + 1, 0, area)
      }),

      setAreaHeight: (areaId, height) => set((state) => {
        const area = state.doc.areas.find(a => a.id === areaId)
        if (area) area.height = height
      }),

      setAreaName: (areaId, name) => set((state) => {
        const area = state.doc.areas.find(a => a.id === areaId)
        if (area) area.name = name
      }),

      selectArea: (areaId) => set((state) => {
        state.selectedAreaId = areaId
      }),

      // ─── Section actions ────────────────────────────

      addSection: (areaId, preset) => set((state) => {
        const area = state.doc.areas.find(a => a.id === areaId)
        if (!area) return
        const section = createSection(preset, state.doc.grid.cols)
        area.sections.push(section)
      }),

      moveSection: (sectionId, toIndex) => set((state) => {
        const result = findSectionInDoc(state.doc, sectionId)
        if (!result) return
        const { area } = result
        const fromIndex = area.sections.findIndex(s => s.id === sectionId)
        if (fromIndex === -1) return
        const [section] = area.sections.splice(fromIndex, 1)
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
        for (const area of state.doc.areas) {
          const idx = area.sections.findIndex(s => s.id === sectionId)
          if (idx !== -1) {
            area.sections.splice(idx, 1)
            if (state.selectedSectionId === sectionId) {
              state.selectedSectionId = null
            }
            return
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

      // ─── Block actions ──────────────────────────────

      addBlock: (sectionId, paneId, type) => set((state) => {
        const result = findSectionInDoc(state.doc, sectionId)
        if (!result) return
        const pane = result.section.panes.find(p => p.id === paneId)
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
        for (const area of state.doc.areas) {
          for (const section of area.sections) {
            for (const pane of section.panes) {
              const idx = pane.blocks.findIndex(b => b.id === blockId)
              if (idx !== -1) {
                pane.blocks.splice(idx, 1)
                if (state.selectedBlockId === blockId) {
                  state.selectedBlockId = null
                }
                return
              }
            }
          }
        }
      }),

      moveBlock: (blockId, toSectionId, toPaneId, toIndex) => set((state) => {
        // Remove from current location
        let movedBlock: Block | null = null
        for (const area of state.doc.areas) {
          for (const section of area.sections) {
            for (const pane of section.panes) {
              const idx = pane.blocks.findIndex(b => b.id === blockId)
              if (idx !== -1) {
                [movedBlock] = pane.blocks.splice(idx, 1)
                break
              }
            }
            if (movedBlock) break
          }
          if (movedBlock) break
        }

        if (!movedBlock) return

        // Insert at new location
        const targetResult = findSectionInDoc(state.doc, toSectionId)
        if (!targetResult) return
        const targetPane = targetResult.section.panes.find(p => p.id === toPaneId)
        if (!targetPane) return
        targetPane.blocks.splice(toIndex, 0, movedBlock)
      }),

      // ─── Selection ──────────────────────────────────

      selectBlock: (blockId) => set((state) => {
        state.selectedBlockId = blockId
      }),

      selectSection: (sectionId) => set((state) => {
        state.selectedSectionId = sectionId
      }),

      setActivePaneId: (paneId) => set((state) => {
        state.activePaneId = paneId
      }),

      // ─── Grid ───────────────────────────────────────

      setGridCols: (cols) => set((state) => {
        state.doc.grid.cols = cols
      }),

      setGridGap: (gap) => set((state) => {
        state.doc.grid.gap = gap
      }),

      // ─── Page config ────────────────────────────────

      setPagePreset: (preset) => set((state) => {
        state.doc.page.preset = preset
        state.doc.pages = []
      }),

      setPagePadding: (patch) => set((state) => {
        Object.assign(state.doc.page.padding, patch)
        state.doc.pages = []
      }),

      recalculatePages: (sectionHeights) => set((state) => {
        const { doc } = state
        const dims = resolvePageDimensions(doc.page)
        const paddingTopPx = doc.page.padding.top * MM_TO_PX
        const paddingBottomPx = doc.page.padding.bottom * MM_TO_PX
        const usableHeight = dims.heightPx - paddingTopPx - paddingBottomPx
        const gapPx = doc.grid.gap

        // Calculate fixed areas total height
        let fixedAreasHeight = 0
        for (const area of doc.areas) {
          if (area.type === 'fixed') {
            if (area.height === 'auto') {
              // For fixed areas with 'auto', use measured section heights
              let areaH = 0
              for (const section of area.sections) {
                const h = sectionHeights.get(section.id) ?? 0
                areaH += (areaH > 0 ? h + gapPx : h)
              }
              fixedAreasHeight += (fixedAreasHeight > 0 ? areaH + gapPx : areaH)
            } else {
              fixedAreasHeight += (fixedAreasHeight > 0 ? area.height + gapPx : area.height)
            }
          }
        }

        // List areas get the remaining space
        const listAreaAvailableHeight = usableHeight - fixedAreasHeight - (fixedAreasHeight > 0 ? gapPx : 0)

        // Find the list area (first one for now)
        const listArea = doc.areas.find(a => a.type === 'list')

        if (!listArea) {
          // No list area — single page with all fixed areas
          const page: Page = {
            id: createId(),
            index: 0,
            areaContents: doc.areas.map(area => ({
              areaId: area.id,
              sectionIds: area.sections.map(s => s.id),
            })),
          }
          doc.pages = [page]
          return
        }

        // Calculate effective list area height per page
        const listHeight = listArea.height === 'auto'
          ? listAreaAvailableHeight
          : listArea.height

        // Paginate list area sections
        const listSectionGroups: string[][] = []
        let currentGroup: string[] = []
        let currentHeight = 0

        for (const section of listArea.sections) {
          const h = sectionHeights.get(section.id) ?? 0
          const needed = currentHeight > 0 ? h + gapPx : h

          if (currentHeight + needed > listHeight && currentGroup.length > 0) {
            listSectionGroups.push(currentGroup)
            currentGroup = []
            currentHeight = 0
          }

          currentGroup.push(section.id)
          currentHeight += (currentHeight > 0 ? h + gapPx : h)
        }
        if (currentGroup.length > 0) listSectionGroups.push(currentGroup)

        // Ensure at least one page
        if (listSectionGroups.length === 0) listSectionGroups.push([])

        // Build pages — each page has ALL areas, but list area content varies
        const pages: Page[] = listSectionGroups.map((listSectionIds, idx) => ({
          id: createId(),
          index: idx,
          areaContents: doc.areas.map(area => ({
            areaId: area.id,
            sectionIds: area.id === listArea.id
              ? listSectionIds
              : area.sections.map(s => s.id), // fixed areas repeat fully
          })),
        }))

        doc.pages = pages
      }),

      // ─── Typography ─────────────────────────────────

      setGlobalScaleFactor: (factor) => set((state) => {
        state.doc.typography.scaleFactor = factor
      }),

      setGlobalLineHeight: (height) => set((state) => {
        state.doc.typography.lineHeight = height
      }),
    })),
    {
      // Exclude UI state from undo history
      partialize: (state) => {
        const { selectedBlockId: _a, selectedSectionId: _b, activePaneId: _c, selectedAreaId: _d, ...rest } = state
        void _a; void _b; void _c; void _d
        return rest
      },
    }
  )
)
