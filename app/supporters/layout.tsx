import { AppSidebar } from '@/app/_components/app-sidebar'
import { Users } from '@/components/icon'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

const supporterMenuItems = [
  {
    title: '利用者一覧',
    href: '/supporters/clients',
    icon: Users,
  },
]

export default function SupportersLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar menuItems={supporterMenuItems} />
      <SidebarInset>
        <main className="flex-1">
          <div className="w-full py-6 lg:py-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
