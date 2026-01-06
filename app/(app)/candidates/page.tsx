import Link from "next/link"
import { CandidateSource, CandidateStage } from "@prisma/client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CandidatesFilters } from "@/components/candidates-filters"
import { prisma } from "@/lib/db"
import { getDefaultOrganizationId } from "@/lib/tenant"

export const dynamic = "force-dynamic"

type SearchParams = {
  q?: string
  stage?: string
  source?: string
}

const stageValues = Object.values(CandidateStage)
const sourceValues = Object.values(CandidateSource)

function asEnum<T extends string>(value: string | undefined, allowed: readonly T[]) {
  if (!value) return undefined
  return (allowed as readonly string[]).includes(value) ? (value as T) : undefined
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { q, stage, source } = searchParams
  const orgId = await getDefaultOrganizationId()

  const stageEnum = asEnum(stage, stageValues)
  const sourceEnum = asEnum(source, sourceValues)
  const query = q?.trim()

  const candidates = await prisma.candidate.findMany({
    where: {
      organizationId: orgId,
      stage: stageEnum,
      source: sourceEnum,
      ...(query
        ? {
            OR: [
              { fullName: { contains: query } },
              { title: { contains: query } },
              { location: { contains: query } },
              { email: { contains: query } },
              { notes: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Кандидати</h1>
          <p className="text-muted-foreground text-sm">
            Фільтри, пошук, статуси та джерела (MVP).
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/ai">AI-пошук</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Фільтри</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidatesFilters
            initialQ={query ?? ""}
            initialStage={stageEnum ?? "ALL"}
            initialSource={sourceEnum ?? "ALL"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Список ({candidates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Кандидат</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Локація</TableHead>
                <TableHead>Стадія</TableHead>
                <TableHead>Джерело</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link className="hover:underline" href={`/candidates/${c.id}`}>
                      {c.fullName}
                    </Link>
                    {c.email ? (
                      <div className="text-muted-foreground text-xs">{c.email}</div>
                    ) : null}
                  </TableCell>
                  <TableCell>{c.title ?? "—"}</TableCell>
                  <TableCell>{c.location ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.stage}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.source}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                    Нічого не знайдено. Запусти seed або зміни фільтри.
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

