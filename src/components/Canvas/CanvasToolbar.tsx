import { AddAreaGroup } from './AddAreaGroup'
import { PageSizeGroup } from './PageSizeGroup'
import { PageGapGroup } from './PageGapGroup'
import { PagePaddingGroup } from './PagePaddingGroup'
import { TypographyGroup } from './TypographyGroup'
import { DIVIDER } from './toolbarStyles'

export function CanvasToolbar() {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-slate-200 flex-wrap">
      <AddAreaGroup />
      <div className={DIVIDER} />
      <PageSizeGroup />
      <div className={DIVIDER} />
      <PageGapGroup />
      <div className={DIVIDER} />
      <PagePaddingGroup />
      <div className={DIVIDER} />
      <TypographyGroup />
    </div>
  )
}
