import Link from "next/link"
import { CandidateStage } from "@prisma/client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { prisma } from "@/lib/db"
import { getDefaultOrganizationId } from "@/lib/tenant"

export const dynamic = "force-dynamic"

const stages = Object.values(CandidateStage)

export default async function KanbanPage() {
  const orgId = await getDefaultOrganizationId()

  const candidates = await prisma.candidate.findMany({
    where: { organizationId: orgId },
    orderBy: [{ stage: "asc" }, { updatedAt: "desc" }],
    take: 500,
  })

  const byStage = new Map<CandidateStage, typeof candidates>()
  for (const s of stages) byStage.set(s, [])
  for (const c of candidates) byStage.get(c.stage)?.push(c)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Kanban</h1>
        <p className="text-muted-foreground text-sm">
          Дошка по стадіях кандидата (MVP: без drag-and-drop).
        </p>
      </div>

      <ScrollArea className="w-full whitespace-nowrap rounded-lg border">
        <div className="flex w-max gap-3 p-3">
          {stages.map((stage) => {
            const list = byStage.get(stage) ?? []
            return (
              <Card key={stage} className="w-[320px] shrink-0">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-sm">{stage}</CardTitle>
                  <div className="text-muted-foreground text-xs">{list.length} cards</div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {list.map((c) => (
                    <div key={c.id} className="rounded-md border p-2">
                      <div className="flex items-start justify-between gap-2">
                        <Link className="font-medium hover:underline" href={`/candidates/${c.id}`}>
                          {c.fullName}
                        </Link>
                        <Badge variant="outline" className="shrink-0">
                          {c.source}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {c.title ?? "—"} · {c.location ?? "—"}
                      </div>
                    </div>
                  ))}
                  {list.length === 0 ? (
                    <div className="text-muted-foreground text-sm">Порожньо</div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

