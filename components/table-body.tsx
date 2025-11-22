"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { validateField } from "@/lib/validation-schema"

interface TableBodyProps {
  items: any[]
  columns: string[]
  editedData: Record<string, any>
  onUpdateRow: (internalId: string, data: Record<string, any>) => void
  onDeleteRow: (internalId: string) => void
}

const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    "new customer": "bg-red-100 text-red-800",
    served: "bg-blue-100 text-blue-800",
    "to contact": "bg-yellow-100 text-yellow-800",
    paused: "bg-gray-100 text-gray-800",
  }
  return statusMap[status] || "bg-gray-100 text-gray-800"
}

export function TableBody({ items, columns, editedData, onUpdateRow, onDeleteRow }: TableBodyProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  const startEdit = (internalId: string, column: string, value: any) => {
    setEditingCell(`${internalId}-${column}`)
    setEditValue(String(value))
    setValidationError(null)
  }

  const saveEdit = (internalId: string, column: string) => {
    const validation = validateField(column, editValue)
    if (!validation.valid) {
      setValidationError(validation.error)
      return
    }
    onUpdateRow(internalId, { [column]: editValue })
    setEditingCell(null)
    setValidationError(null)
  }

  const cancelEdit = () => {
    setEditingCell(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent, internalId: string, column: string) => {
    if (e.key === "Enter") {
      saveEdit(internalId, column)
    } else if (e.key === "Escape") {
      cancelEdit()
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted border-b">
          <tr>
            <th className="w-10 px-4 py-2 text-left"></th>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 text-left font-semibold text-foreground whitespace-nowrap">
                {col}
              </th>
            ))}
            <th className="w-10 px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, idx) => (
            <tr key={row._internalId} className="border-b hover:bg-muted/50 transition-colors">
              <td className="px-4 py-2 text-muted-foreground text-xs w-10">{idx + 1}</td>
              {columns.map((col) => {
                const cellKey = `${row._internalId}-${col}`
                const isEditing = editingCell === cellKey
                const displayValue = editedData[row._internalId]?.[col] ?? row[col] ?? ""
                const isStatusColumn = col.toLowerCase() === "state"

                return (
                  <td
                    key={cellKey}
                    className="px-4 py-2 cursor-pointer hover:bg-accent/10 transition-colors"
                    onClick={() => startEdit(row._internalId, col, displayValue)}
                  >
                    {isEditing ? (
                      <div className="flex flex-col gap-1 w-full">
                        <Input
                          ref={inputRef}
                          value={editValue}
                          onChange={(e) => {
                            setEditValue(e.target.value)
                            setValidationError(null)
                          }}
                          onKeyDown={(e) => handleKeyDown(e, row._internalId, col)}
                          onBlur={() => saveEdit(row._internalId, col)}
                          className={cn("h-6 text-xs", validationError && "border-red-500")}
                        />
                        {validationError && <span className="text-red-500 text-xs">{validationError}</span>}
                      </div>
                    ) : (
                      <div className="truncate">
                        {isStatusColumn && displayValue ? (
                          <Badge className={cn("text-xs", getStatusColor(displayValue))}>{displayValue}</Badge>
                        ) : (
                          <span className="text-foreground">{displayValue}</span>
                        )}
                      </div>
                    )}
                  </td>
                )
              })}
              <td className="px-4 py-2 text-center">
                <Button variant="ghost" size="sm" onClick={() => onDeleteRow(row._internalId)} className="h-6 w-6 p-0">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
