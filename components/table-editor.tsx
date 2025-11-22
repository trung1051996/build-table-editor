"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Plus, Filter, Search, Settings, MoreVertical, Zap, X } from "lucide-react"
import { TableBody } from "./table-body"
import { useTableData } from "@/hooks/use-table-data"
import { Skeleton } from "@/components/ui/skeleton"

export function TableEditor() {
  const [search, setSearch] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filterColumn, setFilterColumn] = useState<string | null>(null)
  const [filterValue, setFilterValue] = useState("")
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(["id", "name", "language", "version", "State", "Created Date"]),
  )
  const [isAddingRow, setIsAddingRow] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)

  const { items, isLoading, hasMore, loadMore, addRow, updateRow, deleteRow, editedData } = useTableData({
    search: search.trim(),
    sortColumn,
    sortOrder,
    filterColumn,
    filterValue: filterValue.trim(),
  })

  const handleInfiniteScroll = useCallback(() => {
    if (!tableRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = tableRef.current
    if (scrollHeight - scrollTop <= clientHeight + 500 && hasMore && !isLoading) {
      loadMore()
    }
  }, [hasMore, isLoading, loadMore])

  useEffect(() => {
    const element = tableRef.current
    if (!element) return

    element.addEventListener("scroll", handleInfiniteScroll)
    return () => element.removeEventListener("scroll", handleInfiniteScroll)
  }, [handleInfiniteScroll])

  const allColumns = ["id", "name", "language", "version", "State", "Created Date"]

  const toggleColumn = (column: string) => {
    const newColumns = new Set(visibleColumns)
    if (newColumns.has(column)) {
      newColumns.delete(column)
    } else {
      newColumns.add(column)
    }
    setVisibleColumns(newColumns)
  }

  const handleAddRow = () => {
    setIsAddingRow(true)
    addRow()
    setIsAddingRow(false)
  }

  return (
    <div className="flex flex-col gap-4 h-screen">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold">Table name</h1>
        <Button className="bg-red-500 hover:bg-red-600 text-white gap-2">
          <Zap className="w-4 h-4" />
          Ask AI
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center p-3 bg-muted rounded-lg">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="gap-2 bg-transparent"
          disabled={isAddingRow}
        >
          <Plus className="w-4 h-4" />
          Add row
        </Button>

        <div className="w-48 relative">
          <Search className="w-4 h-4 absolute left-2 top-2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="w-4 h-4" />
              Filter
              {filterColumn && <span className="ml-1 text-xs">({filterColumn})</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                setFilterColumn(null)
                setFilterValue("")
              }}
              className="text-xs text-muted-foreground"
            >
              Clear Filter
            </DropdownMenuItem>
            {allColumns.map((col) => (
              <DropdownMenuItem
                key={col}
                onClick={() => {
                  setFilterColumn(col)
                  setFilterValue("")
                }}
                className={filterColumn === col ? "bg-accent" : ""}
              >
                {col}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {filterColumn && (
          <div className="flex gap-2 items-center bg-white rounded px-2 border">
            <span className="text-sm text-muted-foreground whitespace-nowrap">{filterColumn}:</span>
            <Input
              placeholder="Filter value..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="h-8 w-32 border-0"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterColumn(null)
                setFilterValue("")
              }}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              Sort
              {sortColumn && <span className="ml-1 text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                setSortColumn(null)
                setSortOrder("asc")
              }}
              className="text-xs text-muted-foreground"
            >
              Clear Sort
            </DropdownMenuItem>
            {allColumns.map((col) => (
              <DropdownMenuItem
                key={col}
                onClick={() => {
                  if (sortColumn === col) {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  } else {
                    setSortColumn(col)
                    setSortOrder("asc")
                  }
                }}
                className={sortColumn === col ? "bg-accent" : ""}
              >
                {col} {sortColumn === col && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Settings className="w-4 h-4" />
              Fields
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {allColumns.map((col) => (
              <DropdownMenuItem key={col} onClick={() => toggleColumn(col)} className="flex items-center gap-2">
                <input type="checkbox" checked={visibleColumns.has(col)} readOnly className="w-4 h-4" />
                {col}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Export</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div ref={tableRef} className="flex-1 overflow-auto border rounded-lg bg-card">
        {isLoading && items.length === 0 ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <TableBody
            items={items}
            columns={Array.from(visibleColumns)}
            editedData={editedData}
            onUpdateRow={updateRow}
            onDeleteRow={deleteRow}
          />
        )}

        {isLoading && items.length > 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">Loading more...</div>
        )}
      </div>
    </div>
  )
}
