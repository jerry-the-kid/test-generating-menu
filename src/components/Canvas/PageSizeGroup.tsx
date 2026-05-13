import { useMenuActions, usePageConfig } from '../../store/menuStore'
import type { PageSizePreset } from '../../store/types'
import { GROUP, LABEL } from './toolbarStyles'

const PAGE_PRESETS: { preset: PageSizePreset; label: string }[] = [
  { preset: 'A4', label: 'A4' },
  { preset: 'A3', label: 'A3' },
]

const COL_BTN =
  'w-7 h-7 border border-slate-200 rounded bg-white text-xs font-semibold cursor-pointer text-slate-600 transition-all duration-100 hover:border-blue-500'
const COL_BTN_ACTIVE =
  'w-7 h-7 border rounded text-xs font-semibold cursor-pointer transition-all duration-100 bg-blue-500 border-blue-500 text-white'

export function PageSizeGroup() {
  const { preset: pagePreset } = usePageConfig()
  const { setPagePreset } = useMenuActions()
  return (
    <div className={GROUP}>
      <label className={LABEL}>Page Size:</label>
      {PAGE_PRESETS.map(({ preset, label }) => (
        <button
          key={preset}
          className={pagePreset === preset ? COL_BTN_ACTIVE : COL_BTN}
          onClick={() => setPagePreset(preset)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
