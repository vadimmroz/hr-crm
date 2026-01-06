"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2Icon,
  CalendarIcon,
  Columns3Icon,
  MessagesSquareIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

const nav = [
  { href: "/candidates", label: "Кандидати", icon: UsersIcon },
  { href: "/conversations", label: "Переписки", icon: MessagesSquareIcon },
  { href: "/kanban", label: "Kanban", icon: Columns3Icon },
  { href: "/planner", label: "Планувальник", icon: CalendarIcon },
  { href: "/ai", label: "AI", icon: SparklesIcon },
  { href: "/orgs", label: "Організації", icon: Building2Icon },
] as const

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-2">
        <div className="px-2 pt-2">
          <div className="text-sm font-semibold leading-5">HR CRM</div>
          <div className="text-muted-foreground text-xs">Candidate Sourcing</div>
        </div>
        <Separator />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навігація</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2">
        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground text-xs">Demo</div>
          <ThemeToggle />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

