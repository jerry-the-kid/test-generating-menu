import { useMenuActions, usePageConfig } from '../../store/menuStore'
import { GROUP, LABEL, NUM_INPUT } from './toolbarStyles'

export function PageGapGroup() {
  const { gap } = usePageConfig()
  const { setPageGap } = useMenuActions()
  return (
    <div className={GROUP}>
      <label className={LABEL}>Gap (px):</label>
      <input
        type="number"
        min={0}
        max={64}
        value={gap}
        onChange={(e) => setPageGap(Number(e.target.value))}
        className={`${NUM_INPUT} w-12`}
      />
    </div>
  )
}
