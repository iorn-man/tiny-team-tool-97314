import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen, BarChart3, Code, Briefcase, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dreamCodeLogo from "@/assets/dream-code-logo.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 animate-fade-in">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={dreamCodeLogo} alt="Dream Code" className="h-12 w-auto transition-transform hover:scale-105" />
            <span className="font-bold text-xl">Dream Code</span>
          </div>
          <Button onClick={() => navigate("/login")} className="transition-transform hover:scale-105">Login</Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl font-bold tracking-tight">
            IT Training Courses
          </h1>
          <p className="text-2xl font-semibold text-primary">
            Elevate Your Skills, Ignite Your Career!
          </p>
          <p className="text-xl text-muted-foreground">
            Comprehensive IT training with technical preparation, mock interviews, and HR interview preparation. Pay on success - 40% after placement.
          </p>
          <div className="flex flex-wrap gap-4 justify-center items-center mt-6">
            <Button size="lg" onClick={() => navigate("/login")} className="transition-transform hover:scale-105">
              Get Started
            </Button>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Phone className="h-5 w-5" />
              <span>8668135402</span>
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 rounded-lg border bg-card space-y-3 transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center transition-transform hover:scale-110">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Programming Languages</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Java Development</li>
              <li>• .NET Development</li>
              <li>• Python Programming</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border bg-card space-y-3 transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center transition-transform hover:scale-110">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Development Tracks</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Software Testing</li>
              <li>• MERN Stack Development</li>
              <li>• Front End Development</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border bg-card space-y-3 transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center transition-transform hover:scale-110">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Design & Analytics</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• UI/UX Design</li>
              <li>• Data Analyst</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border bg-card space-y-3 transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center transition-transform hover:scale-110">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Career Support</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Technical Preparation</li>
              <li>• Mock Interviews</li>
              <li>• HR Interview Prep</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 p-8 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border text-center animate-fade-in transition-all hover:shadow-lg">
          <p className="text-2xl font-bold mb-2">Online / Offline</p>
          <p className="text-lg text-muted-foreground">Flexible learning options to suit your schedule</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
