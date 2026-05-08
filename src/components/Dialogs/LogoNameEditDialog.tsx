import { useState, useEffect } from 'react'
import { useMenuStore } from '../../store/menuStore'
import type { LogoNameBlock } from '../../store/types'
import { textToJSON, jsonToText } from '../RichTextInput/utils'
import './Dialogs.css'

interface Props {
  block: LogoNameBlock
  open: boolean
  onClose: () => void
}

export function LogoNameEditDialog({ block, open, onClose }: Props) {
  const updateBlock = useMenuStore(s => s.updateBlock)
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
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <h3 className="dialog-title">Edit Logo & Name</h3>

        <div className="dialog-field">
          <label>Logo URL</label>
          <input
            type="text"
            value={logoUrl}
            onChange={e => setLogoUrl(e.target.value)}
            placeholder="https://... or leave empty"
          />
        </div>

        <div className="dialog-field">
          <label>Brand Name</label>
          <input
            type="text"
            value={brandName}
            onChange={e => setBrandName(e.target.value)}
            placeholder="Your brand name"
          />
        </div>

        <div className="dialog-field">
          <label>Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            placeholder="Optional tagline"
          />
        </div>

        <div className="dialog-field">
          <label>Layout</label>
          <select value={layout} onChange={e => setLayout(e.target.value as 'horizontal' | 'vertical')}>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </div>

        <div className="dialog-actions">
          <button className="dialog-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="dialog-btn-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
