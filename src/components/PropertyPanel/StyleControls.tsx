import type { MenuTextStyle } from '../../store/types'
import { FONT_SIZES } from '../RichTextInput/RichTextInput'
import { PANEL_INPUT, PANEL_LABEL } from './LayoutControls'

const TOGGLE_BASE =
  'bg-white border border-slate-200 rounded cursor-pointer px-2 py-0.5 text-xs text-slate-600 min-w-[26px] h-7 flex items-center justify-center hover:bg-slate-50'
const TOGGLE_ACTIVE =
  'bg-sky-100 border-sky-300 text-sky-700 border rounded cursor-pointer px-2 py-0.5 text-xs min-w-[26px] h-7 flex items-center justify-center'

function ToggleButton({
  active,
  onClick,
  children,
  title,
}: Readonly<{
  active: boolean
  onClick: () => void
  children: React.ReactNode
  title: string
}>) {
  return (
    <button
      type="button"
      className={active ? TOGGLE_ACTIVE : TOGGLE_BASE}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

function ColorPicker({
  value,
  onChange,
}: Readonly<{ value: string; onChange: (v: string) => void }>) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-9 border border-slate-200 rounded cursor-pointer bg-white p-0.5"
        title="Pick color"
      />
      {value && (
        <button
          type="button"
          className="text-[10px] text-slate-400 underline hover:text-slate-600 cursor-pointer"
          onClick={() => onChange('')}
          title="Inherit color"
        >
          clear
        </button>
      )}
    </div>
  )
}

function FontSizeInput({
  value,
  onChange,
}: Readonly<{ value: number; onChange: (v: number) => void }>) {
  return (
    <select
      value={String(value)}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`${PANEL_INPUT} w-20 cursor-pointer`}
    >
      {FONT_SIZES.map((s) => (
        <option key={s} value={s}>
          {s}px
        </option>
      ))}
    </select>
  )
}

const ALIGNS: { value: MenuTextStyle['align']; icon: string; title: string }[] = [
  { value: 'left', icon: '⇤', title: 'Align left' },
  { value: 'center', icon: '↔', title: 'Center' },
  { value: 'right', icon: '⇥', title: 'Align right' },
]

function AlignSegmented({
  value,
  onChange,
}: Readonly<{
  value: MenuTextStyle['align']
  onChange: (v: MenuTextStyle['align']) => void
}>) {
  return (
    <div className="flex items-center gap-1">
      {ALIGNS.map((a) => (
        <ToggleButton
          key={a.value}
          active={value === a.value}
          onClick={() => onChange(a.value)}
          title={a.title}
        >
          {a.icon}
        </ToggleButton>
      ))}
    </div>
  )
}

export function TextStyleEditor({
  label,
  value,
  onChange,
}: Readonly<{
  label?: string
  value: MenuTextStyle
  onChange: (patch: Partial<MenuTextStyle>) => void
}>) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className={PANEL_LABEL}>{label}</label>}
      <div className="flex flex-wrap items-center gap-1.5">
        <ToggleButton active={value.bold} onClick={() => onChange({ bold: !value.bold })} title="Bold">
          <b>B</b>
        </ToggleButton>
        <ToggleButton active={value.italic} onClick={() => onChange({ italic: !value.italic })} title="Italic">
          <i>I</i>
        </ToggleButton>
        <ToggleButton
          active={value.underline}
          onClick={() => onChange({ underline: !value.underline })}
          title="Underline"
        >
          <u>U</u>
        </ToggleButton>
        <span className="w-px h-5 bg-slate-200 mx-0.5" />
        <FontSizeInput value={value.fontSize} onChange={(v) => onChange({ fontSize: v })} />
        <span className="w-px h-5 bg-slate-200 mx-0.5" />
        <ColorPicker value={value.color} onChange={(v) => onChange({ color: v })} />
        <span className="w-px h-5 bg-slate-200 mx-0.5" />
        <AlignSegmented value={value.align} onChange={(v) => onChange({ align: v })} />
      </div>
    </div>
  )
}
