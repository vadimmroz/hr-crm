"use client"

import * as React from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Result = {
  query: string
  usedAI: boolean
  summary?: string
  note?: string
  error?: string
  sourcesUsed?: string[]
  candidates: Array<{
    id: string
    fullName: string
    title?: string | null
    location?: string | null
    stage: string
    source: string
    reason?: string
  }>
}

const allSources = [
  { id: "internal", label: "Internal (CRM DB)" },
  { id: "linkedin", label: "LinkedIn (плейсхолдер)" },
  { id: "email", label: "Email (плейсхолдер)" },
  { id: "job_board", label: "Job boards (плейсхолдер)" },
] as const

export function AISearch() {
  const [query, setQuery] = React.useState(
    "Знайди кандидата на Senior Frontend (React/Next.js), remote, бажано з досвідом дизайн-систем."
  )
  const [sources, setSources] = React.useState<string[]>(["internal"])
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<Result | null>(null)

  async function run() {
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/ai/candidate-search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q, sources }),
      })
      const json = (await res.json()) as Result
      setResult(json)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI пошук по джерелах</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Запит</Label>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Опиши роль, стек, локацію, soft skills, must/plus…"
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Джерела</Label>
            <div className="flex flex-wrap gap-2">
              {allSources.map((s) => {
                const checked = sources.includes(s.id)
                return (
                  <Button
                    key={s.id}
                    type="button"
                    variant={checked ? "default" : "outline"}
                    onClick={() =>
                      setSources((prev) =>
                        checked ? prev.filter((x) => x !== s.id) : [...prev, s.id]
                      )
                    }
                  >
                    {s.label}
                  </Button>
                )
              })}
            </div>
            <div className="text-muted-foreground text-xs">
              MVP: реально працює тільки <b>Internal</b>. Інші джерела тут як заготовка
              для майбутніх інтеграцій.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" onClick={run} disabled={loading}>
              {loading ? "Шукаю…" : "Запустити пошук"}
            </Button>
            <Button type="button" variant="secondary" asChild>
              <Link href="/candidates">До списку кандидатів</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">Результат</CardTitle>
            <div className="text-muted-foreground text-sm">
              {result.usedAI ? "AI: увімкнено" : "AI: вимкнено"} ·{" "}
              {(result.sourcesUsed ?? []).join(", ") || "—"}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.error ? (
              <div className="text-sm">
                <Badge variant="destructive">Помилка</Badge>{" "}
                <span className="text-muted-foreground">{result.error}</span>
              </div>
            ) : null}

            {result.note ? (
              <div className="text-muted-foreground text-sm">{result.note}</div>
            ) : null}

            {result.summary ? (
              <div className="rounded-md border bg-muted/30 p-3 text-sm">
                {result.summary}
              </div>
            ) : null}

            <div className="space-y-2">
              {result.candidates.map((c) => (
                <div key={c.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <Link className="font-medium hover:underline" href={`/candidates/${c.id}`}>
                      {c.fullName}
                    </Link>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{c.stage}</Badge>
                      <Badge variant="outline">{c.source}</Badge>
                    </div>
                  </div>
                  <div className="text-muted-foreground mt-1 text-sm">
                    {c.title ?? "—"} · {c.location ?? "—"}
                  </div>
                  {c.reason ? (
                    <div className="mt-2 whitespace-pre-wrap text-sm">{c.reason}</div>
                  ) : null}
                </div>
              ))}
              {result.candidates.length === 0 ? (
                <div className="text-muted-foreground text-sm">Нічого не знайдено.</div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

