import { useMenuActions, usePageConfig } from '../../store/menuStore'
import { GROUP, LABEL, NUM_INPUT } from './toolbarStyles'

const SIDES = ['top', 'right', 'bottom', 'left'] as const

const MAX = 50

function clamp(v: number) {
  return Math.max(0, Math.min(MAX, Number.isFinite(v) ? v : 0))
}

export function PagePaddingGroup() {
  const { padding } = usePageConfig()
  const { setPagePadding } = useMenuActions()

  const xShared = padding.left === padding.right ? padding.left : ''
  const yShared = padding.top === padding.bottom ? padding.top : ''

  return (
    <div className={GROUP}>
      <label className={LABEL}>Padding (mm):</label>
      {SIDES.map((side) => (
        <label key={side} className={`${LABEL} flex items-center gap-0.5`}>
          {side[0].toUpperCase()}
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX}
            value={padding[side]}
            onChange={(e) => setPagePadding({ [side]: clamp(Number(e.target.value)) })}
            className={`${NUM_INPUT} w-10`}
          />
        </label>
      ))}
      <label className={`${LABEL} flex items-center gap-0.5`}>
        X
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX}
          value={xShared}
          placeholder="—"
          onChange={(e) => {
            const v = clamp(Number(e.target.value))
            setPagePadding({ left: v, right: v })
          }}
          className={`${NUM_INPUT} w-10`}
          title="Sets left and right together"
        />
      </label>
      <label className={`${LABEL} flex items-center gap-0.5`}>
        Y
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX}
          value={yShared}
          placeholder="—"
          onChange={(e) => {
            const v = clamp(Number(e.target.value))
            setPagePadding({ top: v, bottom: v })
          }}
          className={`${NUM_INPUT} w-10`}
          title="Sets top and bottom together"
        />
      </label>
    </div>
  )
}
