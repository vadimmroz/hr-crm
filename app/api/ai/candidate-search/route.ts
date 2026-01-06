import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { getDefaultOrganizationId } from "@/lib/tenant"

const BodySchema = z.object({
  query: z.string().min(1).max(2000),
  sources: z.array(z.string()).optional(),
})

function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim())
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Невалідний запит", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { query } = parsed.data
  const requestedSources = new Set((parsed.data.sources ?? ["internal"]).map((s) => s.toLowerCase()))

  const orgId = await getDefaultOrganizationId()

  // MVP "всі джерела": наразі реально підключене тільки internal (DB).
  const internalCandidates = requestedSources.has("internal")
    ? await prisma.candidate.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { fullName: { contains: query } },
            { title: { contains: query } },
            { location: { contains: query } },
            { email: { contains: query } },
            { notes: { contains: query } },
          ],
        },
        orderBy: { updatedAt: "desc" },
        take: 50,
      })
    : []

  const base = internalCandidates.map((c) => ({
    id: c.id,
    fullName: c.fullName,
    title: c.title,
    location: c.location,
    stage: c.stage,
    source: c.source,
  }))

  // Якщо ключа нема — повертаємо простий "contains search".
  if (!hasOpenAIKey()) {
    return NextResponse.json({
      query,
      usedAI: false,
      sourcesUsed: Array.from(requestedSources),
      note:
        "OPENAI_API_KEY не налаштований — повертаю базовий пошук по внутрішній базі.",
      candidates: base,
      summary:
        base.length > 0
          ? `Знайдено ${base.length} кандидат(ів) по внутрішній базі.`
          : "Збігів не знайдено по внутрішній базі.",
    })
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const prompt = [
      "Ти — AI асистент рекрутера в CRM. Твоя задача: коротко підсумувати запит і пояснити, чому кандидати підходять.",
      "Поверни JSON з полями: summary (string), ranked (масив обʼєктів {id, reason}).",
      "Не вигадуй кандидатів яких немає. Використовуй лише id зі списку нижче.",
      "",
      `Запит: ${query}`,
      "",
      "Кандидати (JSON):",
      JSON.stringify(base),
    ].join("\n")

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0]?.message?.content ?? "{}"
    const ai = z
      .object({
        summary: z.string().default(""),
        ranked: z.array(z.object({ id: z.string(), reason: z.string().default("") })).default([]),
      })
      .safeParse(JSON.parse(content))

    if (!ai.success) {
      return NextResponse.json({
        query,
        usedAI: true,
        sourcesUsed: Array.from(requestedSources),
        candidates: base,
        summary:
          base.length > 0
            ? `Знайдено ${base.length} кандидат(ів) по внутрішній базі.`
            : "Збігів не знайдено по внутрішній базі.",
        note: "AI відповів у неочікуваному форматі — повертаю базовий список.",
      })
    }

    const reasonById = new Map(ai.data.ranked.map((r) => [r.id, r.reason]))
    const rankedIds = ai.data.ranked.map((r) => r.id)
    const ranked = rankedIds
      .map((id) => base.find((c) => c.id === id))
      .filter(Boolean) as typeof base

    // Додаємо кандидати, яких AI не ранжував (на випадок неповного ranked)
    const remaining = base.filter((c) => !rankedIds.includes(c.id))
    const merged = [...ranked, ...remaining].map((c) => ({
      ...c,
      reason: reasonById.get(c.id) ?? "",
    }))

    return NextResponse.json({
      query,
      usedAI: true,
      sourcesUsed: Array.from(requestedSources),
      summary: ai.data.summary || "AI-підсумок готовий.",
      candidates: merged,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({
      query,
      usedAI: false,
      sourcesUsed: Array.from(requestedSources),
      error: "Помилка AI інтеграції",
      candidates: base,
      summary:
        base.length > 0
          ? `Знайдено ${base.length} кандидат(ів) по внутрішній базі.`
          : "Збігів не знайдено по внутрішній базі.",
    })
  }
}

