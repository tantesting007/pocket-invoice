import { describe, expect, it } from 'vitest'
import { paginate } from './pagination'

const items = Array.from({ length: 24 }, (_, index) => index + 1)

describe('paginate', () => {
  it('returns the first page', () => {
    const result = paginate(items, 1, 10)
    expect(result.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(result).toMatchObject({ page: 1, totalPages: 3, totalItems: 24, firstItem: 1, lastItem: 10 })
  })

  it('returns a partial last page', () => {
    const result = paginate(items, 3, 10)
    expect(result.items).toEqual([21, 22, 23, 24])
    expect(result).toMatchObject({ page: 3, firstItem: 21, lastItem: 24 })
  })

  it('clamps pages outside the range', () => {
    expect(paginate(items, 99, 10).page).toBe(3)
    expect(paginate(items, 0, 10).page).toBe(1)
    expect(paginate(items, -2, 10).page).toBe(1)
  })

  it('falls back to page 1 for non-integer input', () => {
    expect(paginate(items, Number.NaN, 10).page).toBe(1)
    expect(paginate(items, 1.5, 10).page).toBe(1)
  })

  it('handles an empty list', () => {
    expect(paginate([], 1, 10)).toEqual({
      items: [],
      page: 1,
      totalPages: 1,
      totalItems: 0,
      firstItem: 0,
      lastItem: 0,
    })
  })
})
