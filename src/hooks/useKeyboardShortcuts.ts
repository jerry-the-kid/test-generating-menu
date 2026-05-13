import { useEffect } from 'react'
import { useMenuActions, useSelectedAreaId, useSelectedBlockId, useSelectedSectionId } from '../store/menuStore'

export function useKeyboardShortcuts() {
  const { deleteBlock, deleteSection, deleteArea, undo, redo } = useMenuActions()
  const selectedBlockId = useSelectedBlockId()
  const selectedSectionId = useSelectedSectionId()
  const selectedAreaId = useSelectedAreaId()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      // Redo: Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
          (e.ctrlKey && e.key === 'y')) {
        e.preventDefault()
        redo()
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
  }, [selectedBlockId, selectedSectionId, selectedAreaId, deleteBlock, deleteSection, deleteArea, undo, redo])
}
