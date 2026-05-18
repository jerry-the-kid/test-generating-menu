import type { CSSProperties } from 'react'
import type { MenuTextStyle } from './types'

export function menuStyleToCss(s: MenuTextStyle, scale = 1): CSSProperties {
  return {
    fontWeight: s.bold ? 700 : 400,
    fontStyle: s.italic ? 'italic' : 'normal',
    textDecoration: s.underline ? 'underline' : 'none',
    color: s.color || undefined,
    fontSize: `${s.fontSize * scale}px`,
    textAlign: s.align,
  }
}
