import { useState, useEffect } from 'react'
import { useMenuActions } from '../../store/menuStore'
import type { LogoNameBlock } from '../../store/types'
import { textToJSON, jsonToText } from '../RichTextInput/utils'

interface Props {
  block: LogoNameBlock
  open: boolean
  onClose: () => void
}

const OVERLAY = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]'
const DIALOG = 'bg-white rounded-xl p-6 min-w-[480px] max-w-[600px] max-h-[80vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)]'
const TITLE = 'mb-5 text-lg font-semibold'
const FIELD = 'mb-4'
const FIELD_LABEL = 'block text-[13px] font-medium mb-1.5 text-neutral-700'
const FIELD_INPUT = 'w-full px-3 py-2 border border-neutral-300 rounded-md text-sm'
const ACTIONS = 'flex justify-end gap-2 mt-5 pt-4 border-t border-neutral-200'
const BTN_CANCEL = 'bg-neutral-100 border border-neutral-300 px-4 py-2 rounded-md cursor-pointer text-[13px] hover:bg-neutral-200'
const BTN_SAVE = 'bg-blue-800 text-white px-5 py-2 rounded-md cursor-pointer text-[13px] font-medium border-0 hover:bg-blue-900'

export function LogoNameEditDialog({ block, open, onClose }: Props) {
  const { updateBlock } = useMenuActions()
  const [logoUrl, setLogoUrl] = useState(block.logoUrl)
  const [brandName, setBrandName] = useState(jsonToText(block.brandName))
  const [tagline, setTagline] = useState(jsonToText(block.tagline))
  const [layout, setLayout] = useState(block.layout)

  useEffect(() => {
    setLogoUrl(block.logoUrl)
    setBrandName(jsonToText(block.brandName))
    setTagline(jsonToText(block.tagline))
    setLayout(block.layout)
  }, [block.logoUrl, block.brandName, block.tagline, block.layout])

  if (!open) return null

  const handleSave = () => {
    updateBlock(block.id, { logoUrl, brandName: textToJSON(brandName), tagline: textToJSON(tagline), layout })
    onClose()
  }

  return (
    <div className={OVERLAY} onClick={onClose}>
      <div className={DIALOG} onClick={e => e.stopPropagation()}>
        <h3 className={TITLE}>Edit Logo & Name</h3>

        <div className={FIELD}>
          <label className={FIELD_LABEL}>Logo URL</label>
          <input
            type="text"
            value={logoUrl}
            onChange={e => setLogoUrl(e.target.value)}
            placeholder="https://... or leave empty"
            className={FIELD_INPUT}
          />
        </div>

        <div className={FIELD}>
          <label className={FIELD_LABEL}>Brand Name</label>
          <input
            type="text"
            value={brandName}
            onChange={e => setBrandName(e.target.value)}
            placeholder="Your brand name"
            className={FIELD_INPUT}
          />
        </div>

        <div className={FIELD}>
          <label className={FIELD_LABEL}>Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            placeholder="Optional tagline"
            className={FIELD_INPUT}
          />
        </div>

        <div className={FIELD}>
          <label className={FIELD_LABEL}>Layout</label>
          <select value={layout} onChange={e => setLayout(e.target.value as 'horizontal' | 'vertical')} className={FIELD_INPUT}>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </div>

        <div className={ACTIONS}>
          <button className={BTN_CANCEL} onClick={onClose}>Cancel</button>
          <button className={BTN_SAVE} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
