"use client"

import { useState, useCallback, useEffect } from "react"
import useSWR from "swr"
import { fillMissingFields } from "@/lib/data-generator"
import { DB_STORAGE } from "@/lib/db-storage"

const DATA_URL = "https://microsoftedge.github.io/Demos/json-dummy-data/5MB.json"
const ROWS_PER_PAGE = 50
const ADDED_ROWS_KEY = "table-editor-added-rows"
const DELETED_ROWS_KEY = "table-editor-deleted-rows"

interface UseTableDataProps {
  search: string
  sortColumn: string | null
  sortOrder: "asc" | "desc"
  filterColumn: string | null
  filterValue: string
}

export function useTableData({ search, sortColumn, sortOrder, filterColumn, filterValue }: UseTableDataProps) {
  const [displayedItems, setDisplayedItems] = useState<any[]>([])
  const [page, setPage] = useState(0)
  const [editedData, setEditedData] = useState<Record<string, any>>({})
  const [allData, setAllData] = useState<any[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [rowIndexMap, setRowIndexMap] = useState<Record<string, any>>({})
  const [addedRows, setAddedRows] = useState<any[]>([])
  const [deletedRows, setDeletedRows] = useState<string[]>([])
  const [isLoadingFromDB, setIsLoadingFromDB] = useState(false)

  const { data, isLoading } = useSWR(
    DATA_URL,
    async (url: string) => {
      setIsLoadingFromDB(true)
      try {
        const cached = await DB_STORAGE.getDataCache()
        if (cached) {
          console.log("[v0] Loaded dataset from IndexedDB")
          setIsLoadingFromDB(false)
          return cached
        }

        // Fetch from URL if not in cache
        console.log("[v0] Fetching dataset from URL...")
        const response = await fetch(url)
        const json = await response.json()

        const filledData = fillMissingFields(json)

        await DB_STORAGE.setDataCache(filledData)
        console.log("[v0] Dataset stored in IndexedDB")

        return filledData
      } finally {
        setIsLoadingFromDB(false)
      }
    },
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  )

  useEffect(() => {
    // Keep small metadata in localStorage
    const cachedAdded = localStorage.getItem(ADDED_ROWS_KEY)
    const cachedDeleted = localStorage.getItem(DELETED_ROWS_KEY)

    if (cachedAdded) {
      setAddedRows(JSON.parse(cachedAdded))
    }
    if (cachedDeleted) {
      setDeletedRows(JSON.parse(cachedDeleted))
    }
  }, [])

  useEffect(() => {
    if (!data) return

    let processed = Array.isArray(data) ? data : data.data || []

    const newRowIndexMap: Record<string, any> = {}
    processed = processed.map((row, idx) => {
      const internalId = `row-${idx}`
      newRowIndexMap[internalId] = row.id
      return {
        ...row,
        _internalId: internalId,
      }
    })

    processed = processed.filter((row) => !deletedRows.includes(row._internalId))
    processed = [...addedRows, ...processed]

    if (search && search.trim()) {
      const searchLower = search.toLowerCase()
      processed = processed.filter((row) => {
        return Object.entries(row).some(([key, val]) => {
          if (!val) return false
          return String(val).toLowerCase().includes(searchLower)
        })
      })
    }

    if (filterColumn && filterValue && filterValue.trim()) {
      const filterLower = filterValue.toLowerCase()
      processed = processed.filter((row) => {
        const columnValue = row[filterColumn]
        if (columnValue === null || columnValue === undefined) return false
        return String(columnValue).toLowerCase().includes(filterLower)
      })
    }

    if (sortColumn) {
      processed = [...processed].sort((a, b) => {
        const aVal = a[sortColumn] ?? ""
        const bVal = b[sortColumn] ?? ""

        let comparison = 0
        if (typeof aVal === "string" && typeof bVal === "string") {
          comparison = aVal.localeCompare(bVal)
        } else if (typeof aVal === "number" && typeof bVal === "number") {
          comparison = aVal - bVal
        } else {
          comparison = String(aVal).localeCompare(String(bVal))
        }

        return sortOrder === "asc" ? comparison : -comparison
      })
    }

    const finalData = processed.map((row) => ({
      ...row,
      ...(editedData[row._internalId] || {}),
    }))

    setAllData(finalData)
    setRowIndexMap(newRowIndexMap)
    setPage(0)
    setDisplayedItems([])
    setIsInitialized(true)
  }, [data, search, sortColumn, sortOrder, filterColumn, filterValue, editedData, addedRows, deletedRows])

  const hasMore = displayedItems.length < allData.length

  const loadMore = useCallback(() => {
    setDisplayedItems((prev) => {
      const start = prev.length
      const end = start + ROWS_PER_PAGE
      const newItems = allData.slice(0, end)
      return newItems
    })
  }, [allData])

  useEffect(() => {
    if (isInitialized && displayedItems.length === 0 && allData.length > 0) {
      loadMore()
    }
  }, [isInitialized, allData, displayedItems.length, loadMore])

  const addRow = useCallback(() => {
    const internalId = `new-${Date.now()}`
    const now = new Date()
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
    const newRow = {
      id: internalId,
      _internalId: internalId,
      name: "",
      Primary: "",
      bio: "",
      language: "Fairfield",
      version: "1.0.0",
      State: "to contact",
      "Created Date": formattedDate,
    }

    setAddedRows((prev) => [newRow, ...prev])
    setAllData((prev) => [newRow, ...prev])
    setDisplayedItems((prev) => [newRow, ...prev])

    const updatedAdded = [newRow, ...addedRows]
    localStorage.setItem(ADDED_ROWS_KEY, JSON.stringify(updatedAdded))
  }, [addedRows])

  const updateRow = useCallback(
    async (internalId: string, updateData: Record<string, any>) => {
      setEditedData((prev) => ({
        ...prev,
        [internalId]: { ...prev[internalId], ...updateData },
      }))

      const cacheData = await DB_STORAGE.getDataCache()
      if (cacheData && Array.isArray(cacheData)) {
        const updated = cacheData.map((row) => (row._internalId === internalId ? { ...row, ...updateData } : row))
        await DB_STORAGE.setDataCache(updated)
      }

      if (internalId.startsWith("new-")) {
        const updatedAdded = addedRows.map((row) => (row._internalId === internalId ? { ...row, ...updateData } : row))
        localStorage.setItem(ADDED_ROWS_KEY, JSON.stringify(updatedAdded))
        setAddedRows(updatedAdded)
      }
    },
    [addedRows],
  )

  const deleteRow = useCallback(
    async (internalId: string) => {
      setAllData((prev) => prev.filter((row) => row._internalId !== internalId))
      setDisplayedItems((prev) => prev.filter((row) => row._internalId !== internalId))

      if (internalId.startsWith("new-")) {
        const updatedAdded = addedRows.filter((row) => row._internalId !== internalId)
        localStorage.setItem(ADDED_ROWS_KEY, JSON.stringify(updatedAdded))
        setAddedRows(updatedAdded)
      } else {
        const updatedDeleted = [...deletedRows, internalId]
        localStorage.setItem(DELETED_ROWS_KEY, JSON.stringify(updatedDeleted))
        setDeletedRows(updatedDeleted)
      }

      const cacheData = await DB_STORAGE.getDataCache()
      if (cacheData && Array.isArray(cacheData)) {
        const filtered = cacheData.filter((row) => row._internalId !== internalId)
        await DB_STORAGE.setDataCache(filtered)
      }
    },
    [addedRows, deletedRows],
  )

  return {
    items: displayedItems,
    isLoading: isLoading || isLoadingFromDB,
    hasMore,
    loadMore,
    addRow,
    updateRow,
    deleteRow,
    editedData,
  }
}
