import { MenuBuilder } from './components/MenuBuilder/MenuBuilder'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

function App() {
  useKeyboardShortcuts()

  return <MenuBuilder />
}

export default App
