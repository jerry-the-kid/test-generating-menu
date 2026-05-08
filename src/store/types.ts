import type { JSONContent } from '@tiptap/react'

// ─── Grid ────────────────────────────────────────────

export interface GridConfig {
  cols: 1 | 2 | 3 | 4
  gap: number
}

// ─── Section Presets ─────────────────────────────────

export type SectionPreset =
  | 'full_width'
  | 'two_col_equal'
  | 'two_col_split'
  | 'three_col'

// ─── Block Types ─────────────────────────────────────

export type BlockType =
  | 'heading'
  | 'subheading'
  | 'menu'
  | 'image'
  | 'logo_name'

// ─── Block Definitions ───────────────────────────────

export interface BaseBlock {
  id: string
  type: BlockType
  libraryId: string | null
  locked: boolean
  marginTop: number
  marginBottom: number
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading'
  content: JSONContent
}

export interface SubheadingBlock extends BaseBlock {
  type: 'subheading'
  content: JSONContent
}

export interface MenuItem {
  name: JSONContent
  price: JSONContent
  unit: JSONContent
}

export interface MenuBlock extends BaseBlock {
  type: 'menu'
  title: JSONContent
  items: MenuItem[]
}

export interface ImageBlock extends BaseBlock {
  type: 'image'
  url: string
  alt: string
  fit: 'cover' | 'contain' | 'fill'
  aspectRatio: string
}

export interface LogoNameBlock extends BaseBlock {
  type: 'logo_name'
  logoUrl: string
  brandName: JSONContent
  tagline: JSONContent
  layout: 'horizontal' | 'vertical'
}

export type Block =
  | HeadingBlock
  | SubheadingBlock
  | MenuBlock
  | ImageBlock
  | LogoNameBlock

// ─── Pane & Section ──────────────────────────────────

export interface Pane {
  id: string
  ratio: number
  blocks: Block[]
}

export interface Section {
  id: string
  colStart: number
  colSpan: number
  panes: Pane[]
  locked: boolean
  type: SectionPreset
}

// ─── Area ─────────────────────────────────────────────

export type AreaType = 'fixed' | 'list'

export interface Area {
  id: string
  name: string
  type: AreaType
  /** Height in px. 'auto' means fill remaining page space */
  height: 'auto' | number
  sections: Section[]
}

// ─── Page ─────────────────────────────────────────────

export type PageSizePreset = 'A4' | 'A3'

export type PageOrientation = 'portrait' | 'landscape'

export interface PageConfig {
  preset: PageSizePreset
  orientation: PageOrientation
  /** Inner padding in mm */
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

/** Resolved dimensions in pixels at 96 DPI (3.7795 px/mm) */
export interface PageDimensions {
  widthPx: number
  heightPx: number
}

/** Content for a single area within a rendered page */
export interface PageAreaContent {
  areaId: string
  sectionIds: string[]
}

/** A single page of content — computed, not persisted as primary state */
export interface Page {
  id: string
  index: number
  areaContents: PageAreaContent[]
}

// ─── Document ────────────────────────────────────────

export interface LibraryItem {
  id: string
  block: Block
}

export interface GlobalTypography {
  /** Scale multiplier: 0.8 | 0.9 | 1.0 | 1.1 | 1.2 */
  scaleFactor: number
  /** Line height: 1.0 – 2.0 */
  lineHeight: number
}

export interface MenuDoc {
  id: string
  name: string
  templateId: string | null
  grid: GridConfig
  page: PageConfig
  typography: GlobalTypography
  areas: Area[]
  pages: Page[]
  library: LibraryItem[]
}

// ─── Property Panel Schema ───────────────────────────

export type PropFieldType =
  | 'input'
  | 'textarea'
  | 'select'
  | 'btns'
  | 'toggle'
  | 'colors'
  | 'image_upload'
  | 'tags_input'
  | 'note'

export interface PropField {
  key: string
  label: string
  type: PropFieldType
  options?: string[]
  default?: unknown
  required?: boolean
}

export interface BlockTypeDef {
  type: BlockType
  label: string
  category: 'text' | 'menu' | 'media' | 'layout' | 'info'
  icon: string
  defaults: Partial<Block>
  propSchema: PropField[]
}
