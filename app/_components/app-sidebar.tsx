'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from '@/components/icon'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export interface MenuItem {
  title: string
  href: string
  icon: LucideIcon
}

interface AppSidebarProps {
  menuItems: MenuItem[]
}

export function AppSidebar({ menuItems }: AppSidebarProps) {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="h-14 px-2">
        {state === 'expanded' ? (
          <button
            type="button"
            className="flex items-center justify-center w-full h-full hover:bg-accent hover:text-accent-foreground rounded-md px-2 transition-colors"
            onClick={toggleSidebar}
          >
            <Image src="/logo.svg" alt="CareHub" width={160} height={40} priority />
          </button>
        ) : (
          <button
            type="button"
            className="flex items-center justify-center w-full h-full hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            onClick={toggleSidebar}
          >
            <Image src="/icon.svg" alt="CareHub" width={32} height={32} priority />
          </button>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
