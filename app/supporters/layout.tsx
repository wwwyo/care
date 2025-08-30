import { AppSidebar } from '@/components/layout/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function SupportersLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar userRole="supporter" />
      <SidebarInset>
        <main className="flex-1">
          <div className="container mx-auto px-8 py-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
