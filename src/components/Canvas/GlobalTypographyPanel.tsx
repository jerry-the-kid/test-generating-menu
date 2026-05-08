import { useMenuStore } from '../../store/menuStore'
import './GlobalTypographyPanel.css'

const SCALE_STEPS = [
  { label: 'Nho', value: 0.8 },
  { label: 'Hoi nho', value: 0.9 },
  { label: 'Trung binh', value: 1.0 },
  { label: 'Hoi lon', value: 1.1 },
  { label: 'Sieu lon', value: 1.2 },
]

export function GlobalTypographyPanel() {
  const scaleFactor = useMenuStore(s => s.doc.typography.scaleFactor)
  const lineHeight = useMenuStore(s => s.doc.typography.lineHeight)
  const setScale = useMenuStore(s => s.setGlobalScaleFactor)
  const setLineHeight = useMenuStore(s => s.setGlobalLineHeight)

  const scaleIndex = SCALE_STEPS.findIndex(s => s.value === scaleFactor)

  return (
    <div className="global-typography-panel">
      <div className="typo-control">
        <label className="typo-label">CO CHU</label>
        <input
          type="range"
          min={0}
          max={SCALE_STEPS.length - 1}
          step={1}
          value={scaleIndex >= 0 ? scaleIndex : 2}
          onChange={(e) => setScale(SCALE_STEPS[+e.target.value].value)}
          className="typo-slider"
        />
        <div className="typo-slider-labels">
          <span>Nho</span>
          <span>Trung binh</span>
          <span>Sieu lon</span>
        </div>
      </div>

      <div className="typo-control">
        <label className="typo-label">KHOANG CACH DONG</label>
        <input
          type="range"
          min={1.0}
          max={2.0}
          step={0.1}
          value={lineHeight}
          onChange={(e) => setLineHeight(+e.target.value)}
          className="typo-slider"
        />
        <div className="typo-slider-labels">
          <span>1.0</span>
          <span>2.0</span>
        </div>
      </div>
    </div>
  )
}
