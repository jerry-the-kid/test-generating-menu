import { useEffect } from 'react'
import { useMenuStore } from '../store/menuStore'

export function useKeyboardShortcuts() {
  const deleteBlock = useMenuStore(s => s.deleteBlock)
  const deleteSection = useMenuStore(s => s.deleteSection)
  const deleteArea = useMenuStore(s => s.deleteArea)
  const selectedBlockId = useMenuStore(s => s.selectedBlockId)
  const selectedSectionId = useMenuStore(s => s.selectedSectionId)
  const selectedAreaId = useMenuStore(s => s.selectedAreaId)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        useMenuStore.temporal.getState().undo()
      }

      // Redo: Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
          (e.ctrlKey && e.key === 'y')) {
        e.preventDefault()
        useMenuStore.temporal.getState().redo()
      }

      // Delete: remove selected block or section
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't intercept if user is typing in an input
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return
        }

        e.preventDefault()
        if (selectedBlockId) {
          deleteBlock(selectedBlockId)
        } else if (selectedSectionId) {
          deleteSection(selectedSectionId)
        } else if (selectedAreaId) {
          deleteArea(selectedAreaId)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedBlockId, selectedSectionId, selectedAreaId, deleteBlock, deleteSection, deleteArea])
}
