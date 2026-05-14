import { useMenuActions } from '../../store/menuStore'
import type { Pane } from '../../store/types'
import {
  ContentAlignmentControl,
  GapControl,
  PANEL_LABEL,
  PANEL_SECTION_DIVIDER,
  SpacingBox,
} from './LayoutControls'

interface PanePanelProps {
  pane: Pane
  sectionId: string
  paneIndex: number
  paneCount: number
}

export function PanePanel({ pane, sectionId, paneIndex, paneCount }: Readonly<PanePanelProps>) {
  const { setPaneGap, setPaneContentAlignment, setPanePadding } = useMenuActions()

  return (
    <>
      <h3 className="text-sm font-semibold mb-1 text-slate-700">Pane</h3>
      <p className="text-xs text-slate-400 mb-4">
        {paneIndex + 1} of {paneCount}
        <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 uppercase tracking-wide">
          {Math.round(pane.ratio * 100)}%
        </span>
      </p>

      <div className="flex flex-col gap-3">
        <ContentAlignmentControl
          value={pane.contentAlignment}
          onChange={(v) => setPaneContentAlignment(sectionId, pane.id, v)}
          hint="applies when section has fixed height"
        />

        <GapControl
          value={pane.gap}
          onChange={(v) => setPaneGap(sectionId, pane.id, v)}
          label="Block gap"
          hint="px between blocks"
        />

        <div className={`${PANEL_SECTION_DIVIDER} flex flex-col gap-1.5`}>
          <label className={PANEL_LABEL}>Padding (px)</label>
          <SpacingBox
            values={pane.padding}
            onChange={(patch) => setPanePadding(sectionId, pane.id, patch)}
          />
        </div>
      </div>
    </>
  )
}
