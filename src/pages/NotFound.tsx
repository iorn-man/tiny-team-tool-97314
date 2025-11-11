import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-primary animate-scale-in">404</h1>
          <h2 className="text-3xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button asChild size="lg" className="gap-2 transition-transform hover:scale-105">
            <Link to="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 transition-transform hover:scale-105">
            <Link to="/login">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>

        <div className="pt-8 text-sm text-muted-foreground">
          <p>Looking for something specific?</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-primary">
            <Search className="h-4 w-4" />
            <span>Try searching from the dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
