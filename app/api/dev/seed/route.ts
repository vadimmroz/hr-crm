import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 })
  }

  const org =
    (await prisma.organization.findFirst()) ??
    (await prisma.organization.create({ data: { name: "Demo HR Agency" } }))

  const existing = await prisma.candidate.count({
    where: { organizationId: org.id },
  })

  if (existing > 0) {
    return NextResponse.json({ ok: true, message: "Seed вже виконаний.", orgId: org.id })
  }

  // Використовуй npm run db:seed для повного seed. Тут — мінімальний fast-seed.
  await prisma.candidate.createMany({
    data: [
      {
        organizationId: org.id,
        fullName: "Ірина Коваль",
        title: "Senior Frontend Engineer",
        location: "Київ / Remote",
        email: "iryna.koval@example.com",
        source: "LINKEDIN",
        stage: "SCREENING",
        notes: "React/Next.js, дизайн-системи.",
      },
      {
        organizationId: org.id,
        fullName: "Максим Литвин",
        title: "Backend Engineer (Node.js)",
        location: "Львів / Hybrid",
        email: "maksym.lytvyn@example.com",
        source: "REFERRAL",
        stage: "INTERVIEW",
      },
    ],
  })

  return NextResponse.json({ ok: true, message: "Seed виконаний.", orgId: org.id })
}

