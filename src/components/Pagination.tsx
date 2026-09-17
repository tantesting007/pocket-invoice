import { Button } from './Button'
import styles from './Pagination.module.css'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <Button aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ‹ Prev
      </Button>
      {pages.map((pageNumber) => (
        <Button
          key={pageNumber}
          aria-label={`Page ${pageNumber}`}
          aria-current={pageNumber === page ? 'page' : undefined}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </Button>
      ))}
      <Button aria-label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next ›
      </Button>
    </nav>
  )
}
