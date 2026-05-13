import { GlobalTypographyPanel } from './GlobalTypographyPanel'
import { GROUP, LABEL } from './toolbarStyles'

export function TypographyGroup() {
  return (
    <div className={GROUP}>
      <label className={LABEL}>Typography:</label>
      <GlobalTypographyPanel />
    </div>
  )
}
