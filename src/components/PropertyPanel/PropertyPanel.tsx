import { useMenuActions, useSelectedBlock } from '../../store/menuStore'
import type { Block, ImageBlock } from '../../store/types'

const FIELD_INPUT_CLASS =
  'px-2.5 py-1.5 border border-slate-200 rounded-md text-[13px] bg-white text-slate-700 ' +
  'focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.1)] ' +
  'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed'

export function PropertyPanel() {
  const selectedBlock = useSelectedBlock()
  const { updateBlock } = useMenuActions()

  if (!selectedBlock) {
    return (
      <div className="h-full overflow-y-auto p-3 bg-slate-50 border-l border-slate-200">
        <div className="flex items-center justify-center h-full text-slate-400 text-[13px] text-center">
          <p>Select a block to edit its properties</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-3 bg-slate-50 border-l border-slate-200">
      <h3 className="text-sm font-semibold mb-4 text-slate-700 capitalize">{selectedBlock.type.replace('_', ' ')}</h3>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold capitalize text-slate-500">Margin Top (px)</label>
          <input
            type="number"
            value={selectedBlock.marginTop}
            disabled={selectedBlock.locked}
            onChange={(e) => updateBlock(selectedBlock.id, { marginTop: Number(e.target.value) })}
            className={FIELD_INPUT_CLASS}
            min={0}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold capitalize text-slate-500">Margin Bottom (px)</label>
          <input
            type="number"
            value={selectedBlock.marginBottom}
            disabled={selectedBlock.locked}
            onChange={(e) => updateBlock(selectedBlock.id, { marginBottom: Number(e.target.value) })}
            className={FIELD_INPUT_CLASS}
            min={0}
          />
        </div>

        {renderBlockFields(selectedBlock, updateBlock)}
      </div>
    </div>
  )
}

function renderBlockFields(block: Block, updateBlock: (id: string, patch: Partial<Block>) => void) {
  const hintClass = 'text-xs text-slate-400 italic m-0'
  const labelClass = 'text-[11px] font-semibold capitalize text-slate-500'
  switch (block.type) {
    case 'heading':
      return (
        <div className="flex flex-col gap-1">
          <p className={hintClass}>Use the inline toolbar to edit text formatting</p>
        </div>
      )
    case 'subheading':
      return (
        <div className="flex flex-col gap-1">
          <p className={hintClass}>Use the inline toolbar to edit text formatting</p>
        </div>
      )
    case 'menu':
      return (
        <div className="flex flex-col gap-1">
          <p className={hintClass}>Click the block to open the editor dialog</p>
        </div>
      )
    case 'image':
      return (
        <>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>URL</label>
            <input type="text" value={block.url} onChange={e => updateBlock(block.id, { url: e.target.value })} className={FIELD_INPUT_CLASS} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Alt Text</label>
            <input type="text" value={block.alt} onChange={e => updateBlock(block.id, { alt: e.target.value })} className={FIELD_INPUT_CLASS} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Fit</label>
            <select value={block.fit} onChange={e => updateBlock(block.id, { fit: e.target.value as ImageBlock['fit'] })} className={FIELD_INPUT_CLASS}>
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="fill">Fill</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Aspect Ratio</label>
            <input type="text" value={block.aspectRatio} onChange={e => updateBlock(block.id, { aspectRatio: e.target.value })} className={FIELD_INPUT_CLASS} placeholder="16/9" />
          </div>
        </>
      )
    case 'logo_name':
      return (
        <div className="flex flex-col gap-1">
          <p className={hintClass}>Click the block to open the editor dialog</p>
        </div>
      )
  }
}
