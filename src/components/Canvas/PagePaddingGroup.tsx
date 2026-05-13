import { useMenuActions, usePageConfig } from '../../store/menuStore'
import { GROUP, LABEL, NUM_INPUT } from './toolbarStyles'

const SIDES = ['top', 'right', 'bottom', 'left'] as const

export function PagePaddingGroup() {
  const { padding } = usePageConfig()
  const { setPagePadding } = useMenuActions()
  return (
    <div className={GROUP}>
      <label className={LABEL}>Padding (mm):</label>
      {SIDES.map((side) => (
        <label key={side} className={`${LABEL} flex items-center gap-0.5`}>
          {side[0].toUpperCase()}
          <input
            type="number"
            min={0}
            max={50}
            value={padding[side]}
            onChange={(e) => setPagePadding({ [side]: Number(e.target.value) })}
            className={`${NUM_INPUT} w-10`}
          />
        </label>
      ))}
    </div>
  )
}
