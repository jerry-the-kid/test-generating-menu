import { useMenuStore } from '../../store/menuStore'
import './PageTabs.css'

export function PageTabs() {
  const pages = useMenuStore(s => s.doc.pages)

  if (pages.length <= 1) return null

  function scrollToPage(index: number) {
    const el = document.getElementById(`page-${index}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="page-tabs">
      {pages.map(page => (
        <button
          key={page.id}
          className="page-tab"
          onClick={() => scrollToPage(page.index)}
        >
          Page {page.index + 1}
        </button>
      ))}
    </div>
  )
}
