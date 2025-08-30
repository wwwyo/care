import { AppSidebar } from '@/components/layout/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function FacilityLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar userRole="facility_staff" />
      <SidebarInset>
        <main className="flex-1">
          <div className="container mx-auto px-8 py-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
