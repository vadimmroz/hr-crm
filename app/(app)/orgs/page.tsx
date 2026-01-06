import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function OrgsPage() {
  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "asc" },
    include: { accounts: true, _count: { select: { candidates: true, conversations: true, events: true } } },
    take: 50,
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Організації</h1>
        <p className="text-muted-foreground text-sm">
          Мультитенантність на рівні моделей (MVP: демо-організація).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Список ({orgs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Назва</TableHead>
                <TableHead>Акаунти</TableHead>
                <TableHead>Кандидати</TableHead>
                <TableHead>Переписки</TableHead>
                <TableHead>Події</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgs.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.name}</TableCell>
                  <TableCell>{o.accounts.length}</TableCell>
                  <TableCell>{o._count.candidates}</TableCell>
                  <TableCell>{o._count.conversations}</TableCell>
                  <TableCell>{o._count.events}</TableCell>
                </TableRow>
              ))}
              {orgs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                    Організацій поки немає.
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

