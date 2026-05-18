import { useSortable } from '@dnd-kit/react/sortable'
import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import {
  useActivePanelLevel,
  useMenuActions,
  useMenuStyle,
  useSelectedBlockId,
  useTypography,
} from '../../store/menuStore'
import { menuStyleToCss } from '../../store/menuStyle'
import type { Block, HeadingBlock, SubheadingBlock, MenuBlock, ImageBlock, LogoNameBlock } from '../../store/types'
import { RichTextDisplay } from '../RichTextInput/RichTextInput'
import { resolveHorizontalMargin } from '../PropertyPanel/LayoutControls'
import { cx } from './styles'
import './BlockRenderer.css'

const BLOCK_ITEM_BASE =
  'border border-transparent rounded text-[13px] cursor-pointer transition-all duration-100 hover:border-slate-200 hover:bg-slate-50 [&:hover_.block-drag-handle]:opacity-100'
const BLOCK_ITEM_SELECTED = 'border-blue-500 bg-blue-50 hover:border-blue-500 hover:bg-blue-50'
const BLOCK_ITEM_LOCKED = 'opacity-70 cursor-default'
const BLOCK_ITEM_DRAGGING = 'opacity-40 border-blue-500'

export function BlockRenderer({ block, index }: Readonly<{ block: Block; index: number }>) {
  const { ref, isDragging } = useSortable({
    id: block.id,
    index,
    type: 'block',
    accept: ['block'],
    disabled: block.locked,
  })

  const { selectBlock } = useMenuActions()
  const selectedBlockId = useSelectedBlockId()
  const activePanelLevel = useActivePanelLevel()
  const isSelected = activePanelLevel === 'block' && selectedBlockId === block.id

  const { marginLeft, marginRight } = resolveHorizontalMargin(block.alignment, block.margin)

  const style: CSSProperties = {
    width: `${block.widthPercent}%`,
    marginTop: `${block.margin.top}px`,
    marginBottom: `${block.margin.bottom}px`,
    marginLeft,
    marginRight,
    paddingTop: `${block.padding.top}px`,
    paddingRight: `${block.padding.right}px`,
    paddingBottom: `${block.padding.bottom}px`,
    paddingLeft: `${block.padding.left}px`,
  }

  return (
    <div
      ref={ref}
      className={cx(
        BLOCK_ITEM_BASE,
        isSelected && BLOCK_ITEM_SELECTED,
        block.locked && BLOCK_ITEM_LOCKED,
        isDragging && BLOCK_ITEM_DRAGGING,
      )}
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        selectBlock(block.id)
      }}
    >
      <div className="flex items-start">
        <div className="flex-1 min-w-0">
          <BlockVisual block={block} />
        </div>
      </div>
    </div>
  )
}

function BlockVisual({ block }: Readonly<{ block: Block }>) {
  switch (block.type) {
    case 'heading':
      return <HeadingVisual block={block} />
    case 'subheading':
      return <SubheadingVisual block={block} />
    case 'menu':
      return <MenuVisual block={block} />
    case 'image':
      return <ImageVisual block={block} />
    case 'logo_name':
      return <LogoNameVisual block={block} />
  }
}

function HeadingVisual({ block }: Readonly<{ block: HeadingBlock }>) {
  return (
    <div className="w-full">
      <RichTextDisplay content={block.content} placeholder="Enter heading..." className="heading-input" />
    </div>
  )
}

function SubheadingVisual({ block }: Readonly<{ block: SubheadingBlock }>) {
  return (
    <div className="w-full">
      <RichTextDisplay content={block.content} placeholder="Enter subheading..." className="subheading-input" />
    </div>
  )
}

function MenuVisual({ block }: Readonly<{ block: MenuBlock }>) {
  const menuStyle = useMenuStyle()
  const { scaleFactor } = useTypography()
  const titleStyle = useMemo(() => menuStyleToCss(menuStyle.title, scaleFactor), [menuStyle.title, scaleFactor])
  const itemStyle = useMemo(() => menuStyleToCss(menuStyle.item, scaleFactor), [menuStyle.item, scaleFactor])

  return (
    <div className="w-full flex flex-col" style={{ gap: `${block.gap}px` }}>
      <div style={titleStyle}>{block.title || 'Category'}</div>
      <div className="flex flex-col" style={{ gap: `${block.gap}px` }}>
        {block.items.map((item, idx) => (
          <div key={idx} className="flex w-full items-center justify-between gap-1.5" style={itemStyle}>
            <span className="flex-1 min-w-0">{item.name}</span>
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span>{item.price}</span>
              {item.unit && <span className="text-[0.85em] opacity-70">{item.unit}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImageVisual({ block }: Readonly<{ block: ImageBlock }>) {
  return (
    <div className="w-full rounded-md overflow-hidden">
      {block.url ? (
        <img
          src={block.url}
          alt={block.alt}
          className="w-full block rounded-md"
          style={{ objectFit: block.fit, aspectRatio: block.aspectRatio }}
        />
      ) : (
        <div
          className="w-full bg-slate-100 border-2 border-dashed border-slate-300 rounded-md flex flex-col items-center justify-center gap-2 min-h-[120px]"
          style={{ aspectRatio: block.aspectRatio }}
        >
          <span className="text-[28px] opacity-50">image</span>
          <span className="text-xs text-slate-400">Use the panel to upload</span>
        </div>
      )}
    </div>
  )
}

function LogoNameVisual({ block }: Readonly<{ block: LogoNameBlock }>) {
  const isVertical = block.layout === 'vertical'
  const wrapperBase = isVertical
    ? 'w-full flex flex-col items-center text-center py-2 logo-name-vertical'
    : 'w-full flex items-center py-2'
  const logoSize = isVertical ? 'w-16 h-16' : 'w-12 h-12'

  return (
    <div className={wrapperBase} style={{ gap: `${block.gap}px` }}>
      <div className="flex-shrink-0">
        {block.logoUrl ? (
          <img src={block.logoUrl} alt="Logo" className={`${logoSize} object-contain rounded-md`} />
        ) : (
          <div className={`${logoSize} bg-slate-100 border-2 border-dashed border-slate-300 rounded-md flex items-center justify-center text-[10px] text-slate-400`}>
            Logo
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <RichTextDisplay content={block.brandName} placeholder="Brand Name" className="logo-brand-input" />
        <RichTextDisplay content={block.tagline} placeholder="Tagline (optional)" className="logo-tagline-input" />
      </div>
    </div>
  )
}
