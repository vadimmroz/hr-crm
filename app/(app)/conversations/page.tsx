import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { prisma } from "@/lib/db"
import { getDefaultOrganizationId } from "@/lib/tenant"

export const dynamic = "force-dynamic"

export default async function ConversationsPage() {
  const orgId = await getDefaultOrganizationId()

  const conversations = await prisma.conversation.findMany({
    where: { organizationId: orgId },
    orderBy: { updatedAt: "desc" },
    include: {
      candidate: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    take: 100,
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Переписки</h1>
        <p className="text-muted-foreground text-sm">
          Листування з кандидатами (MVP: читання демо-даних).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Останні ({conversations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Тема</TableHead>
                <TableHead>Кандидат</TableHead>
                <TableHead>Останнє повідомлення</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversations.map((c) => {
                const last = c.messages[0]
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.subject ?? "Без теми"}</TableCell>
                    <TableCell>
                      {c.candidate ? (
                        <Link className="hover:underline" href={`/candidates/${c.candidate.id}`}>
                          {c.candidate.fullName}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[520px]">
                      {last ? (
                        <div className="space-y-1">
                          <div className="text-muted-foreground text-xs">
                            <Badge variant="outline">{last.direction}</Badge>{" "}
                            {last.createdAt.toLocaleString("uk-UA")}
                          </div>
                          <div className="truncate">{last.body}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {conversations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground py-10 text-center">
                    Переписок поки немає.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

