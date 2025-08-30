'use client'

import { Building2, ChevronLeft, ClipboardList, FileText, Home, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import icon from '@/app/icon.svg'
import { Button } from '@/components/ui/button'
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

interface AppSidebarProps {
  userRole: 'supporter' | 'facility_staff' | null
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()

  const supporterMenuItems = [
    {
      title: '利用者一覧',
      href: '/supporters/clients',
      icon: Users,
    },
  ]

  const facilityMenuItems = [
    {
      title: 'ダッシュボード',
      href: '/facility',
      icon: Home,
    },
    {
      title: '空き状況管理',
      href: '/facility/slots',
      icon: Building2,
    },
    {
      title: '施設情報編集',
      href: '/facility/edit',
      icon: FileText,
    },
    {
      title: '照会管理',
      href: '/facility/inquiries',
      icon: ClipboardList,
    },
  ]

  const menuItems =
    userRole === 'supporter'
      ? supporterMenuItems
      : userRole === 'facility_staff'
        ? facilityMenuItems
        : []
  const logoHref =
    userRole === 'supporter'
      ? '/supporters/clients'
      : userRole === 'facility_staff'
        ? '/facility'
        : '/'

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="h-14 px-2">
        {state === 'expanded' ? (
          <div className="flex items-center justify-between h-full">
            <Link href={logoHref} className="flex items-center">
              <Image src="/logo.svg" alt="CareHub" width={160} height={40} priority />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={toggleSidebar}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            className="flex items-center justify-center w-full h-full hover:opacity-80"
            onClick={toggleSidebar}
          >
            <Image src={icon} alt="CareHub" width={32} height={32} priority />
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
