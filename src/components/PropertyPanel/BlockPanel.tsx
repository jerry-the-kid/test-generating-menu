import { useMenuActions } from '../../store/menuStore'
import type { Block, ImageBlock } from '../../store/types'
import {
  AlignmentControl,
  GapControl,
  marginAutoSides,
  PANEL_INPUT,
  PANEL_LABEL,
  PANEL_SECTION_DIVIDER,
  SpacingBox,
  WidthControl,
} from './LayoutControls'

export function BlockPanel({ block }: Readonly<{ block: Block }>) {
  const {
    updateBlock,
    setBlockWidthPercent,
    setBlockGap,
    setBlockAlignment,
    setBlockMargin,
    setBlockPadding,
  } = useMenuActions()

  const marginDisabled = marginAutoSides(block.alignment)
  const gapMeaningful = block.type === 'menu' || block.type === 'logo_name'

  return (
    <>
      <h3 className="text-sm font-semibold mb-4 text-slate-700 capitalize">
        {block.type.replace('_', ' ')}
      </h3>
      <div className="flex flex-col gap-3">
        <WidthControl
          value={block.widthPercent}
          onChange={(v) => setBlockWidthPercent(block.id, v)}
        />

        <AlignmentControl value={block.alignment} onChange={(a) => setBlockAlignment(block.id, a)} />

        <GapControl
          value={block.gap}
          onChange={(v) => setBlockGap(block.id, v)}
          label="Content gap"
          hint={gapMeaningful ? 'px between internal items' : 'no effect for this block type'}
          max={100}
        />

        <div className={`${PANEL_SECTION_DIVIDER} flex flex-col gap-1.5`}>
          <div className="flex items-center justify-between">
            <label className={PANEL_LABEL}>Margin (px)</label>
            {marginDisabled.length > 0 && (
              <span className="text-[10px] text-slate-400 italic">
                {block.alignment === 'center' ? 'L/R: auto' : `${marginDisabled[0]}: auto`}
              </span>
            )}
          </div>
          <SpacingBox
            values={block.margin}
            disabledSides={marginDisabled}
            onChange={(patch) => setBlockMargin(block.id, patch)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={PANEL_LABEL}>Padding (px)</label>
          <SpacingBox
            values={block.padding}
            onChange={(patch) => setBlockPadding(block.id, patch)}
          />
        </div>

        {renderBlockFields(block, updateBlock)}
      </div>
    </>
  )
}

function renderBlockFields(block: Block, updateBlock: (id: string, patch: Partial<Block>) => void) {
  const hintClass = 'text-xs text-slate-400 italic m-0'
  switch (block.type) {
    case 'heading':
    case 'subheading':
      return (
        <div className={`${PANEL_SECTION_DIVIDER} flex flex-col gap-1`}>
          <p className={hintClass}>Use the inline toolbar to edit text formatting</p>
        </div>
      )
    case 'menu':
    case 'logo_name':
      return (
        <div className={`${PANEL_SECTION_DIVIDER} flex flex-col gap-1`}>
          <p className={hintClass}>Click the block to edit content inline</p>
        </div>
      )
    case 'image':
      return (
        <div className={`${PANEL_SECTION_DIVIDER} flex flex-col gap-3`}>
          <div className="flex flex-col gap-1">
            <label className={PANEL_LABEL}>URL</label>
            <input
              type="text"
              value={block.url}
              onChange={(e) => updateBlock(block.id, { url: e.target.value })}
              className={PANEL_INPUT}
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
}
