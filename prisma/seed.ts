import { PrismaClient, CandidateSource, CandidateStage, MessageDirection } from "@prisma/client"

const prisma = new PrismaClient()

function daysFromNow(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

async function main() {
  const org =
    (await prisma.organization.findFirst()) ??
    (await prisma.organization.create({
      data: { name: "Demo HR Agency" },
    }))

  const existingCandidates = await prisma.candidate.count({
    where: { organizationId: org.id },
  })

  if (existingCandidates > 0) return

  await prisma.account.createMany({
    data: [
      { organizationId: org.id, name: "Олена HR", email: "olena@example.com", role: "Recruiter" },
      { organizationId: org.id, name: "Андрій Lead", email: "andrii@example.com", role: "Team Lead" },
    ],
  })

  await prisma.candidate.createMany({
    data: [
      {
        organizationId: org.id,
        fullName: "Ірина Коваль",
        title: "Senior Frontend Engineer",
        location: "Київ / Remote",
        email: "iryna.koval@example.com",
        linkedinUrl: "https://www.linkedin.com/in/iryna-koval/",
        source: CandidateSource.LINKEDIN,
        stage: CandidateStage.SCREENING,
        tags: ["react", "next.js", "typescript"],
        notes: "Сильна по системному дизайну UI, просить вилку $5-6k.",
      },
      {
        organizationId: org.id,
        fullName: "Максим Литвин",
        title: "Backend Engineer (Node.js)",
        location: "Львів / Hybrid",
        email: "maksym.lytvyn@example.com",
        source: CandidateSource.REFERRAL,
        stage: CandidateStage.INTERVIEW,
        tags: ["node", "postgres", "microservices"],
      },
      {
        organizationId: org.id,
        fullName: "Софія Гнатюк",
        title: "Product Designer",
        location: "Одеса / Remote",
        source: CandidateSource.JOB_BOARD,
        stage: CandidateStage.SOURCED,
        tags: ["figma", "design-systems", "ux"],
      },
      {
        organizationId: org.id,
        fullName: "Дмитро Савчук",
        title: "QA Automation (Playwright)",
        location: "Дніпро / Remote",
        source: CandidateSource.EMAIL,
        stage: CandidateStage.NEW,
        tags: ["playwright", "typescript", "ci"],
      },
    ],
  })

  const first = await prisma.candidate.findFirst({
    where: { organizationId: org.id },
    orderBy: { createdAt: "asc" },
  })

  if (first) {
    const conv = await prisma.conversation.create({
      data: {
        organizationId: org.id,
        candidateId: first.id,
        subject: "Скринінг: доступність та очікування",
        messages: {
          create: [
            {
              direction: MessageDirection.OUTBOUND,
              body: "Привіт! Підкажіть, будь ласка, вашу доступність на короткий дзвінок та salary expectations?",
            },
            {
              direction: MessageDirection.INBOUND,
              body: "Вітаю! Можу завтра після 16:00, очікування $5-6k net (залежить від бенефітів).",
            },
          ],
        },
      },
    })

    await prisma.event.createMany({
      data: [
        {
          organizationId: org.id,
          candidateId: first.id,
          title: "Скринінг-дзвінок",
          startsAt: daysFromNow(1),
          endsAt: daysFromNow(1),
          notes: `Розмова з кандидатом. Conversation: ${conv.id}`,
        },
        {
          organizationId: org.id,
          title: "Планування тижня (Recruiting Sync)",
          startsAt: daysFromNow(2),
          endsAt: daysFromNow(2),
        },
      ],
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

