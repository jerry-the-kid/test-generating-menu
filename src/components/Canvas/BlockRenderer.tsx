import { useSortable } from '@dnd-kit/react/sortable'
import { useRef } from 'react'
import type { CSSProperties } from 'react'
import { useActivePanelLevel, useMenuActions, useSelectedBlockId } from '../../store/menuStore'
import type { Block, HeadingBlock, SubheadingBlock, MenuBlock, ImageBlock, LogoNameBlock, MenuItem } from '../../store/types'
import { LazyRichTextInput as RichTextInput } from '../RichTextInput/RichTextInput'
import type { JSONContent } from '@tiptap/react'
import { resolveHorizontalMargin } from '../PropertyPanel/LayoutControls'
import { cx } from './styles'
import './BlockRenderer.css'

const BLOCK_ITEM_BASE =
  'border border-transparent rounded text-[13px] cursor-pointer transition-all duration-100 hover:border-slate-200 hover:bg-slate-50 [&:hover_.block-drag-handle]:opacity-100'
const BLOCK_ITEM_SELECTED = 'border-blue-500 bg-blue-50 hover:border-blue-500 hover:bg-blue-50'
const BLOCK_ITEM_LOCKED = 'opacity-70 cursor-default'
const BLOCK_ITEM_DRAGGING = 'opacity-40 border-blue-500'

export function BlockRenderer({ block, index }: { block: Block; index: number }) {
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

function BlockVisual({ block }: { block: Block }) {
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

function HeadingVisual({ block }: { block: HeadingBlock }) {
  const { updateBlock } = useMenuActions()
  return (
    <div className="w-full">
      <RichTextInput
        content={block.content}
        onUpdate={(json) => updateBlock(block.id, { content: json })}
        placeholder="Enter heading..."
        className="heading-input"
        singleLine
      />
    </div>
  )
}

function SubheadingVisual({ block }: { block: SubheadingBlock }) {
  const { updateBlock } = useMenuActions()
  return (
    <div className="w-full">
      <RichTextInput
        content={block.content}
        onUpdate={(json) => updateBlock(block.id, { content: json })}
        placeholder="Enter subheading..."
        className="subheading-input"
        singleLine
      />
    </div>
  )
}

function MenuVisual({ block }: { block: MenuBlock }) {
  const { updateBlock } = useMenuActions()

  const addItem = () => {
    const emptyItem: MenuItem = {
      name: { type: 'doc', content: [{ type: 'paragraph', content: [] }] },
      price: { type: 'doc', content: [{ type: 'paragraph', content: [] }] },
      unit: { type: 'doc', content: [{ type: 'paragraph', content: [] }] },
    }
    updateBlock(block.id, { items: [...block.items, emptyItem] })
  }

  const updateItem = (idx: number, field: keyof MenuItem, value: JSONContent) => {
    const updated = [...block.items]
    updated[idx] = { ...updated[idx], [field]: value }
    updateBlock(block.id, { items: updated })
  }

  const removeItem = (idx: number) => {
    updateBlock(block.id, { items: block.items.filter((_, i) => i !== idx) })
  }

  return (
    <div className="w-full flex flex-col" style={{ gap: `${block.gap}px` }}>
      <RichTextInput
        content={block.title}
        onUpdate={(json) => updateBlock(block.id, { title: json })}
        placeholder="Category name"
        className="menu-title-input"
        singleLine
      />
      <div className="flex flex-col" style={{ gap: `${block.gap}px` }}>
        {block.items.map((item, idx) => (
          <div key={idx} className="flex w-full items-center justify-between gap-1.5 group">
            <div className="flex-1">
              <RichTextInput
                content={item.name}
                onUpdate={(json) => updateItem(idx, 'name', json)}
                placeholder="Item name"
                className="menu-item-name-input"
                singleLine
              />
            </div>
            <div className="w-[70px]">
              <RichTextInput
                content={item.price}
                onUpdate={(json) => updateItem(idx, 'price', json)}
                placeholder="Price"
                className="menu-item-price-input"
                singleLine
              />
            </div>
            <button
              className="bg-transparent border-0 text-red-600 cursor-pointer text-sm px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-red-50"
              onClick={(e) => { e.stopPropagation(); removeItem(idx) }}
            >
              x
            </button>
          </div>
        ))}
      </div>
      <button
        className="self-start bg-transparent border border-dashed border-slate-300 text-slate-500 text-xs px-3 py-1 rounded cursor-pointer mt-1 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50"
        onClick={(e) => { e.stopPropagation(); addItem() }}
      >
        + Add Item
      </button>
    </div>
  )
}

function ImageVisual({ block }: { block: ImageBlock }) {
  const { updateBlock } = useMenuActions()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    updateBlock(block.id, { url, alt: file.name })
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    fileRef.current?.click()
  }

  return (
    <div className="w-full cursor-pointer rounded-md overflow-hidden" onClick={handleClick}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
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
          <span className="text-xs text-slate-400">Click to add image</span>
        </div>
      )}
    </div>
  )
}

function LogoNameVisual({ block }: { block: LogoNameBlock }) {
  const { updateBlock } = useMenuActions()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    updateBlock(block.id, { logoUrl: url })
  }

  const isVertical = block.layout === 'vertical'
  // `logo-name-vertical` class kept so the CSS file can apply `text-align: center`
  // to the ProseMirror children (which we can't reach via Tailwind utilities)
  const wrapperBase = isVertical
    ? 'w-full flex flex-col items-center text-center py-2 logo-name-vertical'
    : 'w-full flex items-center py-2'
  const logoSize = isVertical ? 'w-16 h-16' : 'w-12 h-12'

  return (
    <div className={wrapperBase} style={{ gap: `${block.gap}px` }}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
      <div className="cursor-pointer flex-shrink-0" onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}>
        {block.logoUrl ? (
          <img src={block.logoUrl} alt="Logo" className={`${logoSize} object-contain rounded-md`} />
        ) : (
          <div className={`${logoSize} bg-slate-100 border-2 border-dashed border-slate-300 rounded-md flex items-center justify-center text-[10px] text-slate-400`}>
            Logo
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <RichTextInput
          content={block.brandName}
          onUpdate={(json) => updateBlock(block.id, { brandName: json })}
          placeholder="Brand Name"
          className="logo-brand-input"
          singleLine
        />
        <RichTextInput
          content={block.tagline}
          onUpdate={(json) => updateBlock(block.id, { tagline: json })}
          placeholder="Tagline (optional)"
          className="logo-tagline-input"
          singleLine
        />
      </div>
    </div>
  )
}
