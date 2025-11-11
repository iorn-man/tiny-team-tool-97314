import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen, BarChart3, Code, Briefcase, Phone, LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import dreamCodeLogo from "@/assets/dream-code-logo.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      // Redirect based on role
      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "faculty":
          navigate("/faculty/dashboard");
          break;
        case "student":
          navigate("/student/dashboard");
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 animate-fade-in">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={dreamCodeLogo} alt="Dream Code" className="h-12 w-auto transition-transform hover:scale-105" />
            <span className="font-bold text-xl">Dream Code</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/login")} className="transition-transform hover:scale-105">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl font-bold tracking-tight">
            Institute Management System
          </h1>
          <p className="text-2xl font-semibold text-primary">
            Streamline Your Educational Institution
          </p>
          <p className="text-xl text-muted-foreground">
            A comprehensive platform for managing students, faculty, courses, attendance, grades, and more. Role-based access for Admin, Faculty, and Students.
          </p>
          <div className="flex flex-wrap gap-4 justify-center items-center mt-6">
            <Button size="lg" onClick={() => navigate("/login")} className="transition-transform hover:scale-105">
              <UserPlus className="h-5 w-5 mr-2" />
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="transition-transform hover:scale-105">
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </Button>
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 rounded-lg border bg-card space-y-3 transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center transition-transform hover:scale-110">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Admin Dashboard</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Manage students & faculty</li>
              <li>• Course administration</li>
              <li>• System-wide reports</li>
              <li>• Announcements & feedback</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border bg-card space-y-3 transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center transition-transform hover:scale-110">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Faculty Portal</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Manage course content</li>
              <li>• Mark attendance</li>
              <li>• Grade assignments</li>
              <li>• Student performance tracking</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border bg-card space-y-3 transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center transition-transform hover:scale-110">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Student Portal</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• View enrolled courses</li>
              <li>• Track attendance & grades</li>
              <li>• Access announcements</li>
              <li>• Submit feedback</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 p-8 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border text-center animate-fade-in transition-all hover:shadow-lg">
          <p className="text-2xl font-bold mb-2">Role-Based Access Control</p>
          <p className="text-lg text-muted-foreground">Secure authentication with separate portals for Admin, Faculty, and Students</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
