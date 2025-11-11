import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "admin" | "faculty" | "student";
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar role={role} />
        <div className="flex-1 flex flex-col">
          <DashboardHeader role={role} />
          <main className="flex-1 p-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
