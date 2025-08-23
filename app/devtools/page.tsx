"use client"

import { useEffect, useMemo, useState } from "react"
import { Columnist } from "@/lib"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type Row = Record<string, unknown> & { id?: number }

export default function DevtoolsPage() {
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [rows, setRows] = useState<Row[]>([])
  const [query, setQuery] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [jsonInput, setJsonInput] = useState("{\n  \"id\": 1\n}")
  const [exportJson, setExportJson] = useState("")
  const [status, setStatus] = useState<string>("Initializing...")
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initDevtools = async () => {
      try {
        // Try to get existing DB first
        let db
        try {
          db = Columnist.getDB()
        } catch {
          // Initialize with default schema if not exists
          db = await Columnist.init("columnist-devtools", {
            schema: {
              messages: {
                columns: { id: "number", user_id: "number", message: "string", timestamp: "date" },
                primaryKey: "id",
                searchableFields: ["message"],
                secondaryIndexes: ["user_id", "timestamp"]
              }
            }
          })
        }
        
        const schema = db.getSchema()
        const tbls = Object.keys(schema)
        setTables(tbls)
        if (!selectedTable && tbls.length) setSelectedTable(tbls[0])
        setIsInitialized(true)
        setStatus("Ready")
      } catch (e: any) {
        setStatus(`Initialization error: ${e.message}`)
        setIsInitialized(false)
      }
    }
    
    initDevtools()
  }, [])

  useEffect(() => {
    (async () => {
      if (!selectedTable) return
      try {
        const db = Columnist.getDB()
        const all = await db.getAll(selectedTable, 500)
        setRows(all)
      } catch (e: any) {
        setStatus(e?.message || "Failed to load rows")
      }
    })()
  }, [selectedTable])

  const onInsert = async () => {
    try {
      const db = Columnist.getDB()
      const obj = JSON.parse(jsonInput)
      await db.insert(obj, selectedTable)
      setStatus("Inserted")
      const all = await db.getAll(selectedTable, 500)
      setRows(all)
    } catch (e: any) {
      setStatus(e?.message || "Insert failed")
    }
  }

  const onUpdate = async () => {
    try {
      const db = Columnist.getDB()
      const obj = JSON.parse(jsonInput)
      const id = obj.id
      if (typeof id !== "number") throw new Error("Provide numeric id in JSON")
      delete obj.id
      await db.update(id, obj, selectedTable)
      setStatus("Updated")
      const all = await db.getAll(selectedTable, 500)
      setRows(all)
    } catch (e: any) {
      setStatus(e?.message || "Update failed")
    }
  }

  const onDelete = async () => {
    try {
      const db = Columnist.getDB()
      const obj = JSON.parse(jsonInput)
      const id = obj.id
      if (typeof id !== "number") throw new Error("Provide numeric id in JSON")
      await db.delete(id, selectedTable)
      setStatus("Deleted")
      const all = await db.getAll(selectedTable, 500)
      setRows(all)
    } catch (e: any) {
      setStatus(e?.message || "Delete failed")
    }
  }

  const onSearch = async () => {
    try {
      const db = Columnist.getDB()
      const results = await db.search(searchTerm, { table: selectedTable, limit: 100 })
      setRows(results)
      setStatus(`Search returned ${results.length}`)
    } catch (e: any) {
      setStatus(e?.message || "Search failed")
    }
  }

  const onFind = async () => {
    try {
      const db = Columnist.getDB()
      const where = query.trim() ? JSON.parse(query) : undefined
      const results = await db.find({ table: selectedTable, where, limit: 200 })
      setRows(results)
      setStatus(`Query returned ${results.length}`)
    } catch (e: any) {
      setStatus(e?.message || "Find failed")
    }
  }

  const onExport = async () => {
    try {
      const db = Columnist.getDB()
      const data = await db.export({ tables: selectedTable ? [selectedTable] : undefined })
      setExportJson(JSON.stringify(data, null, 2))
      setStatus("Exported")
    } catch (e: any) {
      setStatus(e?.message || "Export failed")
    }
  }

  const onImport = async (mode: "merge" | "replace") => {
    try {
      const db = Columnist.getDB()
      const data = JSON.parse(exportJson)
      await db.import(data, mode)
      const all = await db.getAll(selectedTable, 500)
      setRows(all)
      setStatus(`Imported (${mode})`)
    } catch (e: any) {
      setStatus(e?.message || "Import failed")
    }
  }

  if (!isInitialized) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Columnist Devtools</h1>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm">{status}</p>
        </div>
        {status.includes("error") && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Visit <a href="/test" className="text-primary underline">/test</a> first to initialize the database, then return here.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Columnist Devtools</h1>
      <p className="text-sm text-muted-foreground">Inspect tables, run queries, search, and import/export data.</p>

      <Card>
        <CardContent className="p-4 grid gap-4 md:grid-cols-4 items-end">
          <div>
            <label className="text-sm">Table</label>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Search</label>
            <Input className="mt-1" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="full-text search" />
          </div>
          <Button onClick={onSearch}>Search</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 grid gap-4 md:grid-cols-4 items-end">
          <div className="md:col-span-3">
            <label className="text-sm">Where (JSON)</label>
            <Textarea className="mt-1 font-mono" rows={3} value={query} onChange={e => setQuery(e.target.value)} placeholder='{"user_id": 1, "timestamp": {"$gte": "2025-01-01"}}' />
          </div>
          <Button onClick={onFind}>Find</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 grid gap-4 md:grid-cols-4 items-end">
          <div className="md:col-span-3">
            <label className="text-sm">Row JSON</label>
            <Textarea className="mt-1 font-mono" rows={6} value={jsonInput} onChange={e => setJsonInput(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={onInsert}>Insert</Button>
            <Button variant="outline" onClick={onUpdate}>Update</Button>
            <Button variant="destructive" onClick={onDelete}>Delete</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 grid gap-4 md:grid-cols-2">
          <div>
            <div className="flex gap-2 items-end">
              <Button size="sm" onClick={onExport}>Export</Button>
              <Button size="sm" variant="outline" onClick={() => onImport("merge")}>Import (merge)</Button>
              <Button size="sm" variant="destructive" onClick={() => onImport("replace")}>Import (replace)</Button>
            </div>
            <Textarea className="mt-2 font-mono" rows={8} value={exportJson} onChange={e => setExportJson(e.target.value)} placeholder="{}" />
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {rows[0] && Object.keys(rows[0]).map(k => (
                    <th key={k} className="text-left p-2 border-b">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b align-top">
                    {Object.keys(rows[0] || {}).map(k => (
                      <td key={k} className="p-2 font-mono whitespace-pre-wrap">{String((r as any)[k])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {status && (
        <p className="text-xs text-muted-foreground">{status}</p>
      )}
    </div>
  )
}


