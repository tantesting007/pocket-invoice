export interface Page<T> {
  items: T[]
  /** 1-based page number, clamped to the available range */
  page: number
  totalPages: number
  totalItems: number
  /** 1-based position of the first item on the page (0 when empty) */
  firstItem: number
  /** 1-based position of the last item on the page (0 when empty) */
  lastItem: number
}

export function paginate<T>(items: T[], requestedPage: number, pageSize: number): Page<T> {
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const page = Number.isInteger(requestedPage) ? Math.min(Math.max(requestedPage, 1), totalPages) : 1
  const start = (page - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)

  return {
    items: pageItems,
    page,
    totalPages,
    totalItems,
    firstItem: pageItems.length > 0 ? start + 1 : 0,
    lastItem: start + pageItems.length,
  }
}
