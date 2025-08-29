import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardContent } from "@/components/dashboard-content";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-black">
        {/* Sidebar completamente fixo - não se move com scroll */}
        <div className="fixed left-0 top-0 h-screen w-64 z-50 flex-shrink-0">
          <AppSidebar />
        </div>
        
        {/* Conteúdo principal com margem esquerda para compensar o sidebar fixo */}
        <div className="flex-1 ml-64 overflow-auto">
          <DashboardContent />
        </div>
      </div>
    </SidebarProvider>
  );
}
