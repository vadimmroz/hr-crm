import { addDays } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlannerDatePicker } from "@/components/planner-date-picker"
import { prisma } from "@/lib/db"
import { getDefaultOrganizationId } from "@/lib/tenant"

export const dynamic = "force-dynamic"

type SearchParams = { date?: string }

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { date } = searchParams
  const orgId = await getDefaultOrganizationId()

  const dateISO =
    date && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : new Date().toISOString().slice(0, 10)

  const start = new Date(dateISO + "T00:00:00.000Z")
  const end = addDays(start, 1)

  const events = await prisma.event.findMany({
    where: {
      organizationId: orgId,
      startsAt: { gte: start, lt: end },
    },
    orderBy: { startsAt: "asc" },
    include: { candidate: true },
    take: 100,
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Планувальник</h1>
          <p className="text-muted-foreground text-sm">
            Події по днях (MVP: місячний календар + список).
          </p>
        </div>
        <PlannerDatePicker dateISO={dateISO} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Події ({events.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {events.length === 0 ? (
            <div className="text-muted-foreground text-sm">На цей день подій немає.</div>
          ) : (
            <ul className="space-y-2">
              {events.map((e) => (
                <li key={e.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">{e.title}</div>
                    <div className="text-muted-foreground text-xs">
                      {e.startsAt.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
                      {e.endsAt
                        ? ` — ${e.endsAt.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}`
                        : ""}
                    </div>
                  </div>
                  {e.candidate ? (
                    <div className="text-muted-foreground mt-1 text-sm">
                      Кандидат: {e.candidate.fullName}
                    </div>
                  ) : null}
                  {e.notes ? <div className="mt-2 whitespace-pre-wrap text-sm">{e.notes}</div> : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

