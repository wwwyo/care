import { AppSidebar } from '@/components/layout/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function SupportersLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar userRole="supporter" />
      <SidebarInset>
        <main className="flex-1">
          <div className="w-full py-6 lg:py-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
