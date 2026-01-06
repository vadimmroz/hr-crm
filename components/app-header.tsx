"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppHeader() {
  const router = useRouter()
  const [q, setQ] = React.useState("")

  return (
    <header className="bg-background/70 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 flex items-center gap-2 border-b px-3 py-2 backdrop-blur">
      <SidebarTrigger />
      <form
        className="flex flex-1 items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const query = q.trim()
          router.push(query ? `/candidates?q=${encodeURIComponent(query)}` : "/candidates")
        }}
      >
        <div className="relative w-full max-w-lg">
          <SearchIcon className="text-muted-foreground absolute left-2 top-2.5 size-4" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Пошук кандидатів (імʼя, теги, роль, локація)…"
            className="pl-8"
          />
        </div>
        <Button type="submit" variant="secondary">
          Пошук
        </Button>
      </form>
    </header>
  )
}

