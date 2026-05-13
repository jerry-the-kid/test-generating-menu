// Shared Tailwind class strings used across Canvas/Section/Pane components.

export const SECTION_FRAME =
  'border-2 border-dashed border-slate-300 rounded-lg p-2 relative bg-white transition-[border-color,box-shadow] duration-150 hover:border-slate-400'
export const SECTION_FRAME_SELECTED =
  'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
export const SECTION_FRAME_DRAGGING = 'opacity-50 border-blue-500'
export const SECTION_FRAME_LOCKED = 'border-amber-500 bg-amber-50'

export const SECTION_HEADER =
  'flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100'
export const DRAG_HANDLE =
  'cursor-grab text-base text-slate-400 select-none leading-none active:cursor-grabbing'
export const LOCK_BADGE = 'text-xs'
export const SECTION_TYPE_LABEL = 'text-[11px] text-slate-400 capitalize'

export const SECTION_TOOLBAR =
  'absolute -top-8 right-0 flex gap-1 bg-white border border-slate-200 rounded-md p-1 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
export const SECTION_TOOLBAR_BTN =
  'px-2 py-1 border-0 rounded bg-transparent text-xs cursor-pointer text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent'
export const SECTION_TOOLBAR_BTN_DANGER =
  'px-2 py-1 border-0 rounded bg-transparent text-xs cursor-pointer text-slate-600 hover:bg-red-50 hover:text-red-600'

export const PANE_CONTAINER =
  'flex-1 [height:min-content] border border-slate-200 rounded-md min-h-[60px] bg-[#fafbfc] transition-[border-color,box-shadow] duration-150 cursor-pointer'
export const PANE_CONTAINER_ACTIVE =
  'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.15)] bg-blue-50'
export const PANE_EMPTY =
  'flex items-center justify-center h-full min-h-[60px] text-slate-300 text-xs'

export const AREA_FRAME_BASE =
  'border-2 rounded-[10px] p-0 relative flex flex-col transition-[border-color,box-shadow] duration-150'
export const AREA_FRAME_FIXED = 'border-amber-300 bg-[#fffef5]'
export const AREA_FRAME_LIST = 'border-blue-400 bg-[#f8fbff] flex-1 min-h-0'
export const AREA_SELECTED = 'shadow-[0_0_0_3px_rgba(59,130,246,0.2)]'

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function formatSectionType(type: string) {
  return type.replaceAll('_', ' ')
}
