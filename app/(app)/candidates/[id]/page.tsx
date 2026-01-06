import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { prisma } from "@/lib/db"
import { getDefaultOrganizationId } from "@/lib/tenant"

export const dynamic = "force-dynamic"

export default async function CandidateDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const orgId = await getDefaultOrganizationId()

  const candidate = await prisma.candidate.findFirst({
    where: { id, organizationId: orgId },
  })

  if (!candidate) notFound()

  const [conversations, events] = await Promise.all([
    prisma.conversation.findMany({
      where: { organizationId: orgId, candidateId: candidate.id },
      orderBy: { updatedAt: "desc" },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 30 } },
      take: 10,
    }),
    prisma.event.findMany({
      where: { organizationId: orgId, candidateId: candidate.id },
      orderBy: { startsAt: "desc" },
      take: 20,
    }),
  ])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-muted-foreground text-sm">
            <Link className="hover:underline" href="/candidates">
              ← Кандидати
            </Link>
          </div>
          <h1 className="text-xl font-semibold">{candidate.fullName}</h1>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge variant="secondary">{candidate.stage}</Badge>
            <Badge variant="outline">{candidate.source}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Профіль</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <div className="text-muted-foreground text-xs">Роль</div>
                <div>{candidate.title ?? "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Локація</div>
                <div>{candidate.location ?? "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Email</div>
                <div>{candidate.email ?? "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Телефон</div>
                <div>{candidate.phone ?? "—"}</div>
              </div>
            </div>
            {candidate.linkedinUrl ? (
              <div>
                <div className="text-muted-foreground text-xs">LinkedIn</div>
                <a className="hover:underline" href={candidate.linkedinUrl} target="_blank" rel="noreferrer">
                  {candidate.linkedinUrl}
                </a>
              </div>
            ) : null}
            {candidate.notes ? (
              <>
                <Separator />
                <div>
                  <div className="text-muted-foreground text-xs">Нотатки</div>
                  <div className="whitespace-pre-wrap">{candidate.notes}</div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Планувальник</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {events.length === 0 ? (
              <div className="text-muted-foreground">Подій поки немає.</div>
            ) : (
              <ul className="space-y-2">
                {events.map((e) => (
                  <li key={e.id} className="rounded-md border p-2">
                    <div className="font-medium">{e.title}</div>
                    <div className="text-muted-foreground text-xs">
                      {e.startsAt.toLocaleString("uk-UA")}
                      {e.endsAt ? ` — ${e.endsAt.toLocaleString("uk-UA")}` : ""}
                    </div>
                    {e.notes ? <div className="mt-1 whitespace-pre-wrap text-xs">{e.notes}</div> : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Переписки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {conversations.length === 0 ? (
            <div className="text-muted-foreground text-sm">Переписок поки немає.</div>
          ) : (
            conversations.map((c) => (
              <div key={c.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{c.subject ?? "Без теми"}</div>
                  <div className="text-muted-foreground text-xs">{c.updatedAt.toLocaleString("uk-UA")}</div>
                </div>
                <div className="mt-3 space-y-2">
                  {c.messages.map((m) => (
                    <div key={m.id} className="text-sm">
                      <div className="text-muted-foreground text-xs">
                        {m.direction} · {m.createdAt.toLocaleString("uk-UA")}
                      </div>
                      <div className="whitespace-pre-wrap">{m.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

