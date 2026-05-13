import { useState, useEffect } from 'react'
import { useMenuActions } from '../../store/menuStore'
import type { MenuBlock, MenuItem } from '../../store/types'
import { textToJSON, jsonToText } from '../RichTextInput/utils'

interface Props {
  block: MenuBlock
  open: boolean
  onClose: () => void
}

const OVERLAY = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]'
const DIALOG = 'bg-white rounded-xl p-6 min-w-[480px] max-w-[600px] max-h-[80vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)]'
const TITLE = 'mb-5 text-lg font-semibold'
const FIELD = 'mb-4'
const FIELD_LABEL = 'block text-[13px] font-medium mb-1.5 text-neutral-700'
const FIELD_INPUT = 'w-full px-3 py-2 border border-neutral-300 rounded-md text-sm'
const ITEM_INPUT = 'px-2.5 py-1.5 border border-neutral-300 rounded text-[13px]'
const ACTIONS = 'flex justify-end gap-2 mt-5 pt-4 border-t border-neutral-200'
const BTN_CANCEL = 'bg-neutral-100 border border-neutral-300 px-4 py-2 rounded-md cursor-pointer text-[13px] hover:bg-neutral-200'
const BTN_SAVE = 'bg-blue-800 text-white px-5 py-2 rounded-md cursor-pointer text-[13px] font-medium border-0 hover:bg-blue-900'
const BTN_ADD = 'bg-blue-100 text-blue-800 border-0 px-3 py-1 rounded text-xs cursor-pointer hover:bg-blue-200'
const BTN_REMOVE = 'bg-transparent border-0 text-red-600 text-base cursor-pointer px-2 py-1 rounded hover:bg-red-50'

export function MenuEditDialog({ block, open, onClose }: Props) {
  const { updateBlock } = useMenuActions()
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
    <div className={OVERLAY} onClick={onClose}>
      <div className={DIALOG} onClick={e => e.stopPropagation()}>
        <h3 className={TITLE}>Edit Menu Section</h3>

        <div className={FIELD}>
          <label className={FIELD_LABEL}>Category Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. SO MAI"
            className={FIELD_INPUT}
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[13px] font-medium text-neutral-700">Items</label>
            <button className={BTN_ADD} onClick={addItem}>+ Add Item</button>
          </div>
          <div className="flex flex-col gap-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={item.name}
                  onChange={e => updateItem(idx, 'name', e.target.value)}
                  placeholder="Item name"
                  className={`${ITEM_INPUT} flex-[2]`}
                />
                <input
                  type="text"
                  value={item.price}
                  onChange={e => updateItem(idx, 'price', e.target.value)}
                  placeholder="Price"
                  className={`${ITEM_INPUT} flex-1`}
                />
                <input
                  type="text"
                  value={item.unit}
                  onChange={e => updateItem(idx, 'unit', e.target.value)}
                  placeholder="Unit"
                  className={`${ITEM_INPUT} flex-1`}
                />
                <button className={BTN_REMOVE} onClick={() => removeItem(idx)}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className={ACTIONS}>
          <button className={BTN_CANCEL} onClick={onClose}>Cancel</button>
          <button className={BTN_SAVE} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
