import { AppSidebar } from '@/app/_components/app-sidebar'
import { Building2, ClipboardList, FileText, Home } from '@/components/icon'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

const facilityMenuItems = [
  {
    title: 'ダッシュボード',
    href: '/_facility',
    icon: Home,
  },
  {
    title: '空き状況管理',
    href: '/_facility/slots',
    icon: Building2,
  },
  {
    title: '施設情報編集',
    href: '/_facility/edit',
    icon: FileText,
  },
  {
    title: '照会管理',
    href: '/_facility/inquiries',
    icon: ClipboardList,
  },
]

export default function FacilityLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar menuItems={facilityMenuItems} />
      <SidebarInset>
        <main className="flex-1">
          <div className="container mx-auto px-8 py-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
