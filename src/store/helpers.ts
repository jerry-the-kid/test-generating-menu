import { nanoid } from 'nanoid'
import { textToJSON } from '../components/RichTextInput/utils'
import type { Area, AreaType, Block, BlockType, GlobalTypography, MenuDoc, PageConfig, PageDimensions, PageSizePreset, Pane, Section, SectionPreset, Spacing } from './types'

export function createId(): string {
  return nanoid()
}

export const MM_TO_PX = 3.7795 // 96 DPI
export const DEFAULT_PAGE_GAP_PX = 16
export const DEFAULT_AREA_GAP_PX = 8
export const DEFAULT_SECTION_GAP_PX = 8
export const DEFAULT_BLOCK_GAP_PX = 6

export function defaultSpacing(): Spacing {
  return { top: 0, right: 0, bottom: 0, left: 0 }
}

export const PAGE_SIZE_DIMS: Record<PageSizePreset, { width: number; height: number }> = {
  A4: { width: 210, height: 297 }, // mm
  A3: { width: 297, height: 420 }, // mm
}

export function resolvePageDimensions(config: PageConfig): PageDimensions {
  const base = PAGE_SIZE_DIMS[config.preset]
  const isLandscape = config.orientation === 'landscape'
  const wMm = isLandscape ? base.height : base.width
  const hMm = isLandscape ? base.width : base.height
  return {
    widthPx: Math.round(wMm * MM_TO_PX),
    heightPx: Math.round(hMm * MM_TO_PX),
  }
}

export const DEFAULT_PAGE_CONFIG: PageConfig = {
  preset: 'A4',
  orientation: 'portrait',
  padding: { top: 10, right: 10, bottom: 10, left: 10 },
  gap: DEFAULT_PAGE_GAP_PX,
}

export const DEFAULT_TYPOGRAPHY: GlobalTypography = {
  scaleFactor: 1.0,
  lineHeight: 1.4,
}

export function createEmptyDoc(): MenuDoc {
  return {
    page: DEFAULT_PAGE_CONFIG,
    typography: DEFAULT_TYPOGRAPHY,
    areas: [],
    pages: [],
  }
}

export function createArea(name: string, type: AreaType, height: 'auto' | number = 'auto'): Area {
  return {
    id: createId(),
    name,
    type,
    height,
    gap: DEFAULT_AREA_GAP_PX,
    widthPercent: 100,
    alignment: 'left',
    margin: defaultSpacing(),
    padding: defaultSpacing(),
    sections: [],
  }
}

const SECTION_PRESETS: Record<SectionPreset, () => Pick<Section, 'panes'>> = {
  full_width: () => ({
    panes: [{ id: createId(), ratio: 1, blocks: [] }],
  }),
  two_col_equal: () => ({
    panes: [
      { id: createId(), ratio: 0.5, blocks: [] },
      { id: createId(), ratio: 0.5, blocks: [] },
    ],
  }),
  two_col_split: () => ({
    panes: [
      { id: createId(), ratio: 0.33, blocks: [] },
      { id: createId(), ratio: 0.67, blocks: [] },
    ],
  }),
  three_col: () => ({
    panes: [
      { id: createId(), ratio: 0.33, blocks: [] },
      { id: createId(), ratio: 0.34, blocks: [] },
      { id: createId(), ratio: 0.33, blocks: [] },
    ],
  }),
}

export function createSection(preset: SectionPreset): Section {
  const config = SECTION_PRESETS[preset]()
  return {
    id: createId(),
    locked: false,
    type: preset,
    widthPercent: 100,
    gap: DEFAULT_SECTION_GAP_PX,
    alignment: 'left',
    margin: defaultSpacing(),
    padding: defaultSpacing(),
    ...config,
  }
}

export function createBlock(type: BlockType): Block {
  const base = {
    id: createId(),
    type,
    locked: false,
    widthPercent: 100,
    gap: DEFAULT_BLOCK_GAP_PX,
    alignment: 'left' as const,
    margin: defaultSpacing(),
    padding: defaultSpacing(),
  }

  switch (type) {
    case 'heading':
      return { ...base, type: 'heading', content: textToJSON('Section Title', { fontSize: '36px' }) }
    case 'subheading':
      return { ...base, type: 'subheading', content: textToJSON('Subtitle', { fontSize: '16px' }) }
    case 'menu':
      return { ...base, type: 'menu', title: textToJSON('', { fontSize: '22px' }), items: [] }
    case 'image':
      return { ...base, type: 'image', url: '', alt: '', fit: 'cover', aspectRatio: '16/9' }
    case 'logo_name':
      return { ...base, type: 'logo_name', logoUrl: '', brandName: textToJSON('', { fontSize: '18px' }), tagline: textToJSON('', { fontSize: '12px' }), layout: 'horizontal' }
  }
}

export function findBlockInDoc(doc: MenuDoc, blockId: string): { section: Section; pane: Pane; block: Block; blockIndex: number } | null {
  for (const area of doc.areas) {
    for (const section of area.sections) {
      for (const pane of section.panes) {
        const blockIndex = pane.blocks.findIndex(b => b.id === blockId)
        if (blockIndex !== -1) {
          return { section, pane, block: pane.blocks[blockIndex], blockIndex }
        }
      }
    }
  }
  return null
}

export function findSectionInDoc(doc: MenuDoc, sectionId: string): { area: Area; section: Section; sectionIndex: number } | null {
  for (const area of doc.areas) {
    const sectionIndex = area.sections.findIndex(s => s.id === sectionId)
    if (sectionIndex !== -1) {
      return { area, section: area.sections[sectionIndex], sectionIndex }
    }
  }
  return null
}

export function findBlockAncestors(doc: MenuDoc, blockId: string): { area: Area; section: Section; pane: Pane; block: Block } | null {
  for (const area of doc.areas) {
    for (const section of area.sections) {
      for (const pane of section.panes) {
        const block = pane.blocks.find(b => b.id === blockId)
        if (block) return { area, section, pane, block }
      }
    }
  }
  return null
}
