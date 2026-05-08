import { useRef, useEffect } from 'react'
import { SectionContent } from './SectionContent'
import type { Section } from '../../store/types'

interface Props {
  sections: Section[]
  pageContentWidthPx: number
  onHeightsChange: (heights: Map<string, number>) => void
  styles?: React.CSSProperties
}

export function MeasurementLayer({ sections, pageContentWidthPx, onHeightsChange, styles }: Props) {
  const refs = useRef<Map<string, HTMLElement>>(new Map())

  useEffect(() => {
    function measure() {
      const heights = new Map<string, number>()
      for (const [id, el] of refs.current) {
        heights.set(id, el.getBoundingClientRect().height)
      }
      onHeightsChange(heights)
    }

    // Initial measurement
    measure()

    // Watch for resize (image loads, content changes, etc.)
    const ro = new ResizeObserver(measure)
    for (const el of refs.current.values()) {
      ro.observe(el)
    }
    return () => ro.disconnect()
  }, [sections, onHeightsChange])

  return (
    <div
      aria-hidden="true"
      style={{
        visibility: 'hidden',
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${pageContentWidthPx}px`,
        pointerEvents: 'none',
        zIndex: -1,
        ...styles,
      }}
    >
      {sections.map((section) => (
        <div
          key={section.id}
          ref={(el) => {
            if (el) refs.current.set(section.id, el)
            else refs.current.delete(section.id)
          }}
          className="section-frame"
          style={{ width: '100%' }}
        >
          <div className="section-header">
            <span className="section-type-label">
              {section.type.replace(/_/g, ' ')}
            </span>
          </div>
          <SectionContent section={section} />
        </div>
      ))}
    </div>
  )
}
