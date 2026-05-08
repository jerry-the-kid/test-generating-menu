import { useState, useEffect } from 'react'
import { useMenuStore } from '../../store/menuStore'
import type { MenuBlock, MenuItem } from '../../store/types'
import { textToJSON, jsonToText } from '../RichTextInput/utils'
import './Dialogs.css'

interface Props {
  block: MenuBlock
  open: boolean
  onClose: () => void
}

export function MenuEditDialog({ block, open, onClose }: Props) {
  const updateBlock = useMenuStore(s => s.updateBlock)
  const [title, setTitle] = useState(jsonToText(block.title))
  const [items, setItems] = useState<{ name: string; price: string; unit: string }[]>(
    block.items.map(item => ({
      name: jsonToText(item.name),
      price: jsonToText(item.price),
      unit: jsonToText(item.unit),
    }))
  )

  useEffect(() => {
    setTitle(jsonToText(block.title))
    setItems(block.items.map(item => ({
      name: jsonToText(item.name),
      price: jsonToText(item.price),
      unit: jsonToText(item.unit),
    })))
  }, [block.title, block.items])

  if (!open) return null

  const addItem = () => {
    setItems([...items, { name: '', price: '', unit: '' }])
  }

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, field: 'name' | 'price' | 'unit', value: string) => {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [field]: value }
    setItems(updated)
  }

  const handleSave = () => {
    const jsonItems: MenuItem[] = items.map(item => ({
      name: textToJSON(item.name),
      price: textToJSON(item.price),
      unit: textToJSON(item.unit),
    }))
    updateBlock(block.id, { title: textToJSON(title), items: jsonItems })
    onClose()
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <h3 className="dialog-title">Edit Menu Section</h3>

        <div className="dialog-field">
          <label>Category Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. SO MAI"
          />
        </div>

        <div className="dialog-section">
          <div className="dialog-section-header">
            <label>Items</label>
            <button className="dialog-btn-add" onClick={addItem}>+ Add Item</button>
          </div>
          <div className="dialog-items">
            {items.map((item, idx) => (
              <div key={idx} className="dialog-item-row">
                <input
                  type="text"
                  value={item.name}
                  onChange={e => updateItem(idx, 'name', e.target.value)}
                  placeholder="Item name"
                  className="dialog-item-name"
                />
                <input
                  type="text"
                  value={item.price}
                  onChange={e => updateItem(idx, 'price', e.target.value)}
                  placeholder="Price"
                  className="dialog-item-price"
                />
                <input
                  type="text"
                  value={item.unit}
                  onChange={e => updateItem(idx, 'unit', e.target.value)}
                  placeholder="Unit"
                  className="dialog-item-unit"
                />
                <button className="dialog-btn-remove" onClick={() => removeItem(idx)}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="dialog-actions">
          <button className="dialog-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="dialog-btn-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
