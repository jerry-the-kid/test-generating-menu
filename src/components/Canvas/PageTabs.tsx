import { usePages } from '../../store/menuStore'

function scrollToPage(index: number) {
  const el = document.getElementById(`page-${index}`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function PageTabs() {
  const pages = usePages()

  if (pages.length <= 1) return null

  return (
    <div className="flex gap-1 px-4 py-1.5 bg-white border-b border-slate-200">
      {pages.map(page => (
        <button
          key={page.id}
          className="px-3 py-1 border border-slate-200 rounded text-xs font-semibold text-slate-600 bg-white cursor-pointer transition-all duration-100 hover:border-blue-500 hover:text-blue-500"
          onClick={() => scrollToPage(page.index)}
        >
          Page {page.index + 1}
        </button>
      ))}
    </div>
  )
}
