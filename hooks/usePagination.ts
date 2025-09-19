import { useState, useMemo, useCallback } from 'react'

interface UsePaginationProps {
  initialPage?: number
  initialPageSize?: number
  totalItems?: number
}

interface UsePaginationReturn {
  currentPage: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  startIndex: number
  endIndex: number
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  goToFirstPage: () => void
  goToLastPage: () => void
  goToNextPage: () => void
  goToPrevPage: () => void
  getPageItems: <T>(items: T[]) => T[]
  reset: () => void
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0
}: UsePaginationProps = {}): UsePaginationReturn {
  const [currentPage, setCurrentPageState] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize))
  }, [totalItems, pageSize])

  const hasNextPage = useMemo(() => {
    return currentPage < totalPages
  }, [currentPage, totalPages])

  const hasPrevPage = useMemo(() => {
    return currentPage > 1
  }, [currentPage])

  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize
  }, [currentPage, pageSize])

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize, totalItems)
  }, [startIndex, pageSize, totalItems])

  const setCurrentPage = useCallback((page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPageState(clampedPage)
  }, [totalPages])

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(Math.max(1, size))
    setCurrentPageState(1) // Reset to first page when changing page size
  }, [])

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1)
  }, [setCurrentPage])

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages)
  }, [setCurrentPage, totalPages])

  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }, [currentPage, hasNextPage, setCurrentPage])

  const goToPrevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage(currentPage - 1)
    }
  }, [currentPage, hasPrevPage, setCurrentPage])

  const getPageItems = useCallback(<T,>(items: T[]): T[] => {
    return items.slice(startIndex, endIndex)
  }, [startIndex, endIndex])

  const reset = useCallback(() => {
    setCurrentPageState(initialPage)
    setPageSizeState(initialPageSize)
  }, [initialPage, initialPageSize])

  return {
    currentPage,
    pageSize,
    totalPages,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    setCurrentPage,
    setPageSize,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPrevPage,
    getPageItems,
    reset
  }
}
