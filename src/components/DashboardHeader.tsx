import { Bell, User, Moon, Sun } from "lucide-react";
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

interface DashboardHeaderProps {
  role: "admin" | "faculty" | "student";
}

const DashboardHeader = ({ role }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

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

        <Button variant="ghost" size="icon" className="relative transition-transform hover:scale-110">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse"></span>
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
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
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
