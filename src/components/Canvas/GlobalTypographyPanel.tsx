import { useMenuActions, useTypography } from '../../store/menuStore'

const SCALE_STEPS = [
  { label: 'Nho', value: 0.8 },
  { label: 'Hoi nho', value: 0.9 },
  { label: 'Trung binh', value: 1.0 },
  { label: 'Hoi lon', value: 1.1 },
  { label: 'Sieu lon', value: 1.2 },
]

export function GlobalTypographyPanel() {
  const { scaleFactor, lineHeight } = useTypography()
  const { setGlobalScaleFactor: setScale, setGlobalLineHeight: setLineHeight } = useMenuActions()

  const scaleIndex = SCALE_STEPS.findIndex(s => s.value === scaleFactor)

  return (
    <div className="flex flex-row gap-4 py-3">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.5px]">CO CHU</label>
        <input
          type="range"
          min={0}
          max={SCALE_STEPS.length - 1}
          step={1}
          value={scaleIndex >= 0 ? scaleIndex : 2}
          onChange={(e) => setScale(SCALE_STEPS[+e.target.value].value)}
          className="w-full cursor-pointer accent-green-500"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Nho</span>
          <span>Trung binh</span>
          <span>Sieu lon</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.5px]">KHOANG CACH DONG</label>
        <input
          type="range"
          min={1.0}
          max={2.0}
          step={0.1}
          value={lineHeight}
          onChange={(e) => setLineHeight(+e.target.value)}
          className="w-full cursor-pointer accent-green-500"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>1.0</span>
          <span>2.0</span>
        </div>
      </div>
    </div>
  )
}
