import { useRef } from 'react'
import { useMenuActions, useMenuStyle } from '../../store/menuStore'
import type { Block, HeadingBlock, ImageBlock, LogoNameBlock, MenuBlock, SubheadingBlock } from '../../store/types'
import { RichTextInput } from '../RichTextInput/RichTextInput'
import {
  GapControl,
  PANEL_INPUT,
  PANEL_LABEL,
  PANEL_SECTION_DIVIDER,
  SpacingBox,
} from './LayoutControls'
import { TextStyleEditor } from './StyleControls'

const BTN =
  'px-2.5 py-1 border border-slate-200 rounded bg-white text-xs cursor-pointer text-slate-600 transition-all duration-100 hover:border-blue-500 hover:bg-blue-50'
const BTN_DANGER_SM =
  'bg-transparent border-0 text-red-600 cursor-pointer text-sm px-1.5 py-0.5 rounded hover:bg-red-50'

export function BlockPanel({ block }: Readonly<{ block: Block }>) {
  const { setBlockGap, setBlockMargin, setBlockPadding } = useMenuActions()
  const gapMeaningful = block.type === 'menu' || block.type === 'logo_name'

  return (
    <>
      <h3 className="text-sm font-semibold mb-4 text-slate-700 capitalize">
        {block.type.replace('_', ' ')}
      </h3>
      <div className="flex flex-col gap-3">
        <BlockContentEditor block={block} />

        <div className={`${PANEL_SECTION_DIVIDER} flex flex-col gap-3`}>
          {gapMeaningful && (
            <GapControl
              value={block.gap}
              onChange={(v) => setBlockGap(block.id, v)}
              label="Content gap"
              hint="px between internal items"
              max={100}
            />
          )}

          <div className="flex flex-col gap-1.5">
            <label className={PANEL_LABEL}>Margin (px)</label>
            <SpacingBox values={block.margin} onChange={(patch) => setBlockMargin(block.id, patch)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={PANEL_LABEL}>Padding (px)</label>
            <SpacingBox values={block.padding} onChange={(patch) => setBlockPadding(block.id, patch)} />
          </div>
        </div>
      </div>
    </>
  )
}

function BlockContentEditor({ block }: Readonly<{ block: Block }>) {
  switch (block.type) {
    case 'heading':
    case 'subheading':
      return <TextBlockEditor block={block} />
    case 'menu':
      return <MenuBlockEditor block={block} />
    case 'image':
      return <ImageBlockEditor block={block} />
    case 'logo_name':
      return <LogoBlockEditor block={block} />
  }
}

// ─── Heading / Subheading ────────────────────────────────────────────

function TextBlockEditor({ block }: Readonly<{ block: HeadingBlock | SubheadingBlock }>) {
  const { updateBlock } = useMenuActions()
  const label = block.type === 'heading' ? 'Heading' : 'Subheading'
  return (
    <div className="flex flex-col gap-1.5">
      <label className={PANEL_LABEL}>{label}</label>
      <RichTextInput
        alwaysShowToolbar
        content={block.content}
        onUpdate={(json) => updateBlock(block.id, { content: json })}
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </div>
  )
}

// ─── Image ───────────────────────────────────────────────────────────

function ImageBlockEditor({ block }: Readonly<{ block: ImageBlock }>) {
  const { updateBlock } = useMenuActions()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    updateBlock(block.id, { url, alt: file.name })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className={PANEL_LABEL}>Image</label>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button type="button" className={BTN} onClick={() => fileRef.current?.click()}>
          {block.url ? 'Replace image' : 'Upload image'}
        </button>
        {block.url && (
          <button
            type="button"
            className="text-[10px] text-slate-400 underline self-start hover:text-red-600 cursor-pointer"
            onClick={() => updateBlock(block.id, { url: '', alt: '' })}
          >
            Remove image
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className={PANEL_LABEL}>Or paste URL</label>
        <input
          type="text"
          value={block.url}
          onChange={(e) => updateBlock(block.id, { url: e.target.value })}
          className={PANEL_INPUT}
          placeholder="https://..."
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={PANEL_LABEL}>Alt Text</label>
        <input
          type="text"
          value={block.alt}
          onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
          className={PANEL_INPUT}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={PANEL_LABEL}>Fit</label>
        <select
          value={block.fit}
          onChange={(e) => updateBlock(block.id, { fit: e.target.value as ImageBlock['fit'] })}
          className={PANEL_INPUT}
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={PANEL_LABEL}>Aspect Ratio</label>
        <input
          type="text"
          value={block.aspectRatio}
          onChange={(e) => updateBlock(block.id, { aspectRatio: e.target.value })}
          className={PANEL_INPUT}
          placeholder="16/9"
        />
      </div>
    </div>
  )
}

// ─── Logo + Name ─────────────────────────────────────────────────────

function LogoBlockEditor({ block }: Readonly<{ block: LogoNameBlock }>) {
  const { updateBlock } = useMenuActions()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    updateBlock(block.id, { logoUrl: url })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className={PANEL_LABEL}>Logo</label>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
        <button type="button" className={BTN} onClick={() => fileRef.current?.click()}>
          {block.logoUrl ? 'Replace logo' : 'Upload logo'}
        </button>
        {block.logoUrl && (
          <button
            type="button"
            className="text-[10px] text-slate-400 underline self-start hover:text-red-600 cursor-pointer"
            onClick={() => updateBlock(block.id, { logoUrl: '' })}
          >
            Remove logo
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={PANEL_LABEL}>Brand Name</label>
        <RichTextInput
          alwaysShowToolbar
          singleLine
          content={block.brandName}
          onUpdate={(json) => updateBlock(block.id, { brandName: json })}
          placeholder="Brand"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={PANEL_LABEL}>Tagline</label>
        <RichTextInput
          alwaysShowToolbar
          singleLine
          content={block.tagline}
          onUpdate={(json) => updateBlock(block.id, { tagline: json })}
          placeholder="Tagline (optional)"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={PANEL_LABEL}>Layout</label>
        <div className="flex gap-1.5">
          <button
            type="button"
            className={block.layout === 'horizontal' ? `${BTN} border-blue-500 bg-blue-50 text-blue-700` : BTN}
            onClick={() => updateBlock(block.id, { layout: 'horizontal' })}
          >
            Horizontal
          </button>
          <button
            type="button"
            className={block.layout === 'vertical' ? `${BTN} border-blue-500 bg-blue-50 text-blue-700` : BTN}
            onClick={() => updateBlock(block.id, { layout: 'vertical' })}
          >
            Vertical
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Menu ─────────────────────────────────────────────────────────────

function MenuBlockEditor({ block }: Readonly<{ block: MenuBlock }>) {
  const { updateBlock, addMenuItem, updateMenuItem, removeMenuItem, setMenuStyle } = useMenuActions()
  const menuStyle = useMenuStyle()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label className={PANEL_LABEL}>Title</label>
        <TextStyleEditor
          value={menuStyle.title}
          onChange={(patch) => setMenuStyle({ title: patch })}
        />
        <input
          type="text"
          value={block.title}
          onChange={(e) => updateBlock(block.id, { title: e.target.value })}
          className={PANEL_INPUT}
          placeholder="Category"
        />
      </div>

      <div className={`${PANEL_SECTION_DIVIDER} flex flex-col gap-2`}>
        <label className={PANEL_LABEL}>Items</label>
        <TextStyleEditor
          value={menuStyle.item}
          onChange={(patch) => setMenuStyle({ item: patch })}
        />
        <div className="flex flex-col gap-2">
          {block.items.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1 border border-slate-200 rounded p-1.5 bg-white">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateMenuItem(block.id, idx, { name: e.target.value })}
                  className={`${PANEL_INPUT} flex-1`}
                  placeholder="Item name"
                />
                <button
                  type="button"
                  className={BTN_DANGER_SM}
                  onClick={() => removeMenuItem(block.id, idx)}
                  title="Remove item"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={item.price}
                  onChange={(e) => updateMenuItem(block.id, idx, { price: e.target.value })}
                  className={`${PANEL_INPUT} flex-1`}
                  placeholder="Price"
                />
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => updateMenuItem(block.id, idx, { unit: e.target.value })}
                  className={`${PANEL_INPUT} w-16`}
                  placeholder="Unit"
                />
              </div>
            </div>
          ))}
        </div>
        <button type="button" className={`${BTN} self-start mt-1`} onClick={() => addMenuItem(block.id)}>
          + Add Item
        </button>
        <p className="text-[10px] text-slate-400 italic m-0">
          Style applies to every menu in the document.
        </p>
      </div>
    </div>
  )
}
