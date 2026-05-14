import type { JSONContent } from '@tiptap/react'

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

// ─── Spacing & Alignment (shared) ────────────────────

export interface Spacing {
  top: number
  right: number
  bottom: number
  left: number
}

export type Alignment = 'left' | 'center' | 'right'

export type ContentAlignment = 'start' | 'center' | 'end'

// ─── Block Definitions ───────────────────────────────

export interface BaseBlock {
  id: string
  type: BlockType
  locked: boolean
  /** Width as a percentage 10–100 of the parent pane */
  widthPercent: number
  /** Internal gap in px between multi-child block contents (menu items, logo+name) */
  gap: number
  /** Horizontal alignment within the pane (mr-auto / mx-auto / ml-auto) */
  alignment: Alignment
  /** Outer margin in px; left/right overridden by 'auto' based on alignment */
  margin: Spacing
  /** Inner padding in px */
  padding: Spacing
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
  /** Vertical gap in px between blocks inside this pane */
  gap: number
  /** Vertical positioning of blocks inside this pane (maps to flex justifyContent).
   *  Only has visible effect when the section has a fixed height (in 'list' areas)
   *  and content is shorter than the pane. */
  contentAlignment: ContentAlignment
  /** Inner padding in px */
  padding: Spacing
  blocks: Block[]
}

export interface Section {
  id: string
  panes: Pane[]
  locked: boolean
  type: SectionPreset
  /** Width as a percentage 10–100 of the area's content width */
  widthPercent: number
  /** 'min-content' fits content; number is a percentage 10–100 of the parent List area's height.
   *  Only renders meaningfully when the containing Area is type 'list' with a fixed height. */
  height: 'min-content' | number
  /** px; horizontal inter-pane gap (separator width). Inner block-gap lives on Pane. */
  gap: number
  /** Horizontal alignment within the area */
  alignment: Alignment
  /** Outer margin in px; left/right overridden by 'auto' based on alignment */
  margin: Spacing
}

// ─── Area ─────────────────────────────────────────────

export type AreaType = 'fixed' | 'list'

export interface Area {
  id: string
  name: string
  type: AreaType
  /** Height in px. 'auto' means fill remaining page space */
  height: 'auto' | number
  /** Gap in px between sections inside this area */
  gap: number
  /** Width as a percentage 10–100 of the available column width */
  widthPercent: number
  /**
   * Horizontal alignment within the page column.
   * Maps to: left → mr-auto, center → mx-auto, right → ml-auto.
   */
  alignment: Alignment
  /** Outer margin in px. Sides overridden by 'auto' depending on alignment. */
  margin: Spacing
  /** Inner padding in px */
  padding: Spacing
  sections: Section[]
}

// ─── Panel UI ─────────────────────────────────────────

export type PanelLevel = 'area' | 'section' | 'pane' | 'block'

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
  /** Flex gap in px between areas, and between sections inside a list area */
  gap: number
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

export interface GlobalTypography {
  /** Scale multiplier: 0.8 | 0.9 | 1.0 | 1.1 | 1.2 */
  scaleFactor: number
  /** Line height: 1.0 – 2.0 */
  lineHeight: number
}

export interface MenuDoc {
  page: PageConfig
  typography: GlobalTypography
  areas: Area[]
  pages: Page[]
}
