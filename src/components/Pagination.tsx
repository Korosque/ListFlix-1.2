import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const last = Math.max(1, totalPages)
  return (
    <nav className="pagination" aria-label="Paginação">
      <button className="secondary-button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={15} /> Anterior
      </button>
      <span>
        Página {page} de {last}
      </span>
      <button className="secondary-button" disabled={page >= last} onClick={() => onChange(page + 1)}>
        Próxima <ChevronRight size={15} />
      </button>
    </nav>
  )
}
