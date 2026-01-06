"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import { uk } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type Props = {
  dateISO: string
}

export function PlannerDatePicker({ dateISO }: Props) {
  const router = useRouter()
  const sp = useSearchParams()
  const selected = React.useMemo(() => parseISO(dateISO), [dateISO])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start gap-2">
          <CalendarIcon className="size-4" />
          {format(selected, "d MMMM yyyy", { locale: uk })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            if (!d) return
            const nextISO = format(d, "yyyy-MM-dd")
            const params = new URLSearchParams(sp.toString())
            params.set("date", nextISO)
            router.push(`/planner?${params.toString()}`)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

