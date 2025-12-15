import { Bell, User, Moon, Sun, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface DashboardHeaderProps {
  role: "admin" | "faculty" | "student";
}

const DashboardHeader = ({ role }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { announcements } = useAnnouncements();

  // Get recent announcements (last 10)
  const recentAnnouncements = announcements.slice(0, 10);
  const unreadCount = recentAnnouncements.length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getRoleTitle = () => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "faculty":
        return "Faculty";
      case "student":
        return "Student";
    }
  };

  const handleSettingsClick = () => {
    navigate(`/${role}/settings`);
  };

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 transition-colors">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h2 className="text-lg font-semibold hidden sm:block">{getRoleTitle()} Portal</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="transition-transform hover:scale-110"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 transition-all" />
          ) : (
            <Moon className="h-5 w-5 transition-all" />
          )}
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative transition-transform hover:scale-110">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-100px)] mt-4">
              <div className="space-y-4">
                {recentAnnouncements.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No notifications yet
                  </p>
                ) : (
                  recentAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{announcement.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {announcement.content}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {announcement.priority}
                        </Badge>
                      </div>
                      {announcement.created_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(announcement.created_at), "MMM d, yyyy HH:mm")}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSettingsClick}
          className="transition-transform hover:scale-110"
        >
          <Settings className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="transition-transform hover:scale-110">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 animate-scale-in">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
