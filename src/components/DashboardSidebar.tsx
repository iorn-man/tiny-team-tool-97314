import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  MessageSquare,
  Settings,
  UserCheck,
  BarChart3,
  Shield,
  Briefcase,
} from "lucide-react";
import dreamCodeLogo from "@/assets/dream-code-logo-full.jpg";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface DashboardSidebarProps {
  role: "admin" | "faculty" | "student";
}

const DashboardSidebar = ({ role }: DashboardSidebarProps) => {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const adminItems = [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Students", url: "/admin/students", icon: UserCheck },
    { title: "Faculty", url: "/admin/faculty", icon: UserCheck },
    { title: "Courses", url: "/admin/courses", icon: BookOpen },
    { title: "Enrollments", url: "/admin/enrollments", icon: ClipboardCheck },
    { title: "Placements", url: "/admin/placements", icon: Briefcase },
    { title: "Announcements", url: "/admin/announcements", icon: MessageSquare },
    { title: "Feedback", url: "/admin/feedback", icon: FileText },
    { title: "Reports", url: "/admin/reports", icon: BarChart3 },
    { title: "Audit Logs", url: "/admin/audit-logs", icon: Shield },
  ];

  const facultyItems = [
    { title: "Dashboard", url: "/faculty/dashboard", icon: LayoutDashboard },
    { title: "My Courses", url: "/faculty/courses", icon: BookOpen },
    { title: "Attendance", url: "/faculty/attendance", icon: Calendar },
    { title: "Grades", url: "/faculty/grades", icon: ClipboardCheck },
    { title: "Announcements", url: "/faculty/announcements", icon: MessageSquare },
    { title: "Reports", url: "/faculty/reports", icon: BarChart3 },
  ];

  const studentItems = [
    { title: "Dashboard", url: "/student/dashboard", icon: LayoutDashboard },
    { title: "My Courses", url: "/student/courses", icon: BookOpen },
    { title: "Attendance", url: "/student/attendance", icon: Calendar },
    { title: "Grades", url: "/student/grades", icon: ClipboardCheck },
    { title: "Announcements", url: "/student/announcements", icon: MessageSquare },
    { title: "Feedback", url: "/student/feedback", icon: FileText },
  ];

  const items = role === "admin" ? adminItems : role === "faculty" ? facultyItems : studentItems;

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className={collapsed ? "w-14" : "w-64"}>
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <img 
            src={dreamCodeLogo} 
            alt="Dream Code Logo" 
            className="h-10 w-auto object-contain flex-shrink-0"
          />
          {!collapsed && (
            <div>
              <p className="font-semibold text-sm">Institute</p>
              <p className="text-xs text-muted-foreground">Management</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to={`/${role}/settings`} className="flex items-center gap-3">
                    <Settings className="h-4 w-4" />
                    {!collapsed && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
