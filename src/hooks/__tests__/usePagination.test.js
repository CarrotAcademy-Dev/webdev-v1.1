import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import usePagination from '@/hooks/usePagination'

const makeItems = (count) => Array.from({ length: count }, (_, i) => ({ id: i + 1 }))

describe('usePagination', () => {
  it('paginates data into pages', () => {
    const data = makeItems(25)
    const { result } = renderHook(() => usePagination(data, 10))

    expect(result.current.currentPage).toBe(1)
    expect(result.current.totalPages).toBe(3)
    expect(result.current.currentItems.map((item) => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(result.current.hasPrevPage).toBe(false)
    expect(result.current.hasNextPage).toBe(true)
  })

  it('navigates with next, prev, first, last and goToPage', () => {
    const data = makeItems(25)
    const { result } = renderHook(() => usePagination(data, 10))

    act(() => result.current.nextPage())
    expect(result.current.currentPage).toBe(2)

    act(() => result.current.goToLastPage())
    expect(result.current.currentPage).toBe(3)
    expect(result.current.currentItems.map((item) => item.id)).toEqual([21, 22, 23, 24, 25])
    expect(result.current.endIndex).toBe(25)

    act(() => result.current.nextPage())
    expect(result.current.currentPage).toBe(3)

    act(() => result.current.prevPage())
    expect(result.current.currentPage).toBe(2)

    act(() => result.current.goToFirstPage())
    expect(result.current.currentPage).toBe(1)

    act(() => result.current.goToPage(99))
    expect(result.current.currentPage).toBe(3)

    act(() => result.current.goToPage(-5))
    expect(result.current.currentPage).toBe(1)
  })

  it('keeps showing rows when the data shrinks below the current page (e.g. after a search)', () => {
    let data = makeItems(50)
    const { result, rerender } = renderHook(() => usePagination(data, 10))

    act(() => result.current.goToPage(3))
    expect(result.current.currentPage).toBe(3)

    // A search narrows the list to 5 matches: only one page is left.
    data = makeItems(5)
    rerender()

    expect(result.current.totalPages).toBe(1)
    expect(result.current.currentPage).toBe(1)
    expect(result.current.currentItems).toHaveLength(5)
    expect(result.current.startIndex).toBe(0)
    expect(result.current.endIndex).toBe(5)
    expect(result.current.hasPrevPage).toBe(false)
    expect(result.current.hasNextPage).toBe(false)
  })

  it('moves to the new last page when trailing rows are removed', () => {
    let data = makeItems(21)
    const { result, rerender } = renderHook(() => usePagination(data, 10))

    act(() => result.current.goToLastPage())
    expect(result.current.currentPage).toBe(3)

    // The only row on page 3 is deleted and the query refetches.
    data = makeItems(20)
    rerender()

    expect(result.current.currentPage).toBe(2)
    expect(result.current.currentItems.map((item) => item.id)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])

    act(() => result.current.prevPage())
    expect(result.current.currentPage).toBe(1)
  })

  it('navigates relative to the visible page after the data shrank', () => {
    let data = makeItems(50)
    const { result, rerender } = renderHook(() => usePagination(data, 10))

    act(() => result.current.goToPage(5))
    data = makeItems(25)
    rerender()
    expect(result.current.currentPage).toBe(3)

    act(() => result.current.prevPage())
    expect(result.current.currentPage).toBe(2)
    expect(result.current.currentItems.map((item) => item.id)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
  })

  it('handles empty data', () => {
    const { result } = renderHook(() => usePagination([], 10))

    expect(result.current.totalPages).toBe(0)
    expect(result.current.currentPage).toBe(1)
    expect(result.current.currentItems).toEqual([])
    expect(result.current.startIndex).toBe(0)
    expect(result.current.endIndex).toBe(0)

    act(() => result.current.goToLastPage())
    expect(result.current.currentPage).toBe(1)
    expect(result.current.startIndex).toBe(0)
  })
})
