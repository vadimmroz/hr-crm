"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CANDIDATE_SOURCES, CANDIDATE_STAGES } from "@/lib/candidate-constants"

const stageValues = CANDIDATE_STAGES
const sourceValues = CANDIDATE_SOURCES

type Props = {
  initialQ?: string
  initialStage?: string
  initialSource?: string
}

export function CandidatesFilters({ initialQ, initialStage, initialSource }: Props) {
  const router = useRouter()
  const sp = useSearchParams()

  const [q, setQ] = React.useState(initialQ ?? "")
  const [stage, setStage] = React.useState<string>(initialStage ?? "ALL")
  const [source, setSource] = React.useState<string>(initialSource ?? "ALL")

  function apply() {
    const params = new URLSearchParams(sp.toString())

    const query = q.trim()
    if (query) params.set("q", query)
    else params.delete("q")

    if (stage !== "ALL") params.set("stage", stage)
    else params.delete("stage")

    if (source !== "ALL") params.set("source", source)
    else params.delete("source")

    router.push(`/candidates?${params.toString()}`)
  }

  function reset() {
    setQ("")
    setStage("ALL")
    setSource("ALL")
    router.push("/candidates")
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Пошук…" />

      <Select value={stage} onValueChange={setStage}>
        <SelectTrigger>
          <SelectValue placeholder="Стадія" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Усі стадії</SelectItem>
          {stageValues.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={source} onValueChange={setSource}>
        <SelectTrigger>
          <SelectValue placeholder="Джерело" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Усі джерела</SelectItem>
          {sourceValues.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="md:col-span-3 flex items-center gap-2">
        <Button type="button" onClick={apply}>
          Застосувати
        </Button>
        <Button type="button" variant="ghost" onClick={reset}>
          Скинути
        </Button>
      </div>
    </div>
  )
}

