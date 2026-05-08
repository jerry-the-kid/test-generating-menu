import { useSortable } from '@dnd-kit/react/sortable'
import { useRef } from 'react'
import { useMenuStore } from '../../store/menuStore'
import type { Block, HeadingBlock, SubheadingBlock, MenuBlock, ImageBlock, LogoNameBlock, MenuItem } from '../../store/types'
import { LazyRichTextInput as RichTextInput } from '../RichTextInput/RichTextInput'
import type { JSONContent } from '@tiptap/react'
import './BlockRenderer.css'

export function BlockRenderer({ block, index }: { block: Block; index: number }) {
  const { ref, isDragging } = useSortable({
    id: block.id,
    index,
    type: 'block',
    accept: ['block'],
    disabled: block.locked,
  })

  const selectBlock = useMenuStore(s => s.selectBlock)
  const selectedBlockId = useMenuStore(s => s.selectedBlockId)
  const isSelected = selectedBlockId === block.id

  return (
    <div
      ref={ref}
      className={[
        'block-item',
        isSelected && 'selected',
        block.locked && 'locked',
        isDragging && 'dragging',
      ].filter(Boolean).join(' ')}
      style={{
        marginTop: block.marginTop > 0 ? `${block.marginTop}px` : undefined,
        marginBottom: block.marginBottom > 0 ? `${block.marginBottom}px` : undefined,
      }}
      onClick={(e) => {
        e.stopPropagation()
        selectBlock(block.id)
      }}
    >
      <div className="block-item-row">
        <div className="block-item-content">
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
  const updateBlock = useMenuStore(s => s.updateBlock)
  return (
    <div className="block-visual heading-visual">
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
  const updateBlock = useMenuStore(s => s.updateBlock)
  return (
    <div className="block-visual subheading-visual">
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
  const updateBlock = useMenuStore(s => s.updateBlock)

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
    <div className="block-visual menu-visual">
      <RichTextInput
        content={block.title}
        onUpdate={(json) => updateBlock(block.id, { title: json })}
        placeholder="Category name"
        className="menu-title-input"
        singleLine
      />
      <div className="menu-items-list">
        {block.items.map((item, idx) => (
          <div key={idx} className="menu-item-row">
          

          <div className="menu-item-name">
            <RichTextInput
              content={item.name}
              onUpdate={(json) => updateItem(idx, 'name', json)}
              placeholder="Item name"
              
              singleLine
            />
            </div>
            
            <div className="menu-item-price">
            <RichTextInput
              content={item.price}
              onUpdate={(json) => updateItem(idx, 'price', json)}
              placeholder="Price"
              className="menu-item-price"
              singleLine
            />
            </div>
            {/* <RichTextInput
              content={item.unit}
              onUpdate={(json) => updateItem(idx, 'unit', json)}
              placeholder="Unit"
              className="menu-item-unit"
              singleLine
            /> */}
            <button className="menu-item-remove" onClick={(e) => { e.stopPropagation(); removeItem(idx) }}>x</button>
          </div>
        ))}
      </div>
      <button className="menu-add-item-btn" onClick={(e) => { e.stopPropagation(); addItem() }}>+ Add Item</button>
    </div>
  )
}

function ImageVisual({ block }: { block: ImageBlock }) {
  const updateBlock = useMenuStore(s => s.updateBlock)
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
    <div className="block-visual image-visual" onClick={handleClick}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
      {block.url ? (
        <img src={block.url} alt={block.alt} className="image-preview" style={{ objectFit: block.fit, aspectRatio: block.aspectRatio }} />
      ) : (
        <div className="image-placeholder" style={{ aspectRatio: block.aspectRatio }}>
          <span className="image-placeholder-icon">image</span>
          <span className="image-placeholder-text">Click to add image</span>
        </div>
      )}
    </div>
  )
}

function LogoNameVisual({ block }: { block: LogoNameBlock }) {
  const updateBlock = useMenuStore(s => s.updateBlock)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    updateBlock(block.id, { logoUrl: url })
  }

  return (
    <div className={`block-visual logo-name-visual layout-${block.layout}`}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
      <div className="logo-image-area" onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}>
        {block.logoUrl ? (
          <img src={block.logoUrl} alt="Logo" className="logo-img" />
        ) : (
          <div className="logo-placeholder">Logo</div>
        )}
      </div>
      <div className="logo-text-area">
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
