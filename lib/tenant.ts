import { prisma } from "@/lib/db"

export async function getDefaultOrganizationId() {
  const org =
    (await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } })) ??
    (await prisma.organization.create({ data: { name: "Demo HR Agency" } }))
  return org.id
}

