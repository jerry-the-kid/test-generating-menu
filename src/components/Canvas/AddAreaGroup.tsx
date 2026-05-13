import { useMenuActions } from '../../store/menuStore'
import { GROUP, LABEL } from './toolbarStyles'

const ADD_FIXED =
  'px-2.5 py-1 rounded text-xs cursor-pointer transition-all duration-100 border border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-400 hover:bg-amber-100 hover:text-amber-950'
const ADD_LIST =
  'px-2.5 py-1 rounded text-xs cursor-pointer transition-all duration-100 border border-blue-400 bg-blue-50 text-blue-900 hover:border-blue-500 hover:bg-blue-100 hover:text-blue-950'

export function AddAreaGroup() {
  const { addArea } = useMenuActions()
  return (
    <div className={GROUP}>
      <label className={LABEL}>Add Area:</label>
      <button className={ADD_FIXED} onClick={() => addArea('Title', 'fixed')}>+ Fixed</button>
      <button className={ADD_LIST} onClick={() => addArea('Menu Items', 'list')}>+ List</button>
    </div>
  )
}
