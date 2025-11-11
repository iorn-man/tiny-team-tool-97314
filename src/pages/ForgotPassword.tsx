import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Validation Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // UI only - simulate sending reset email
    setTimeout(() => {
      setIsSubmitted(true);
      toast({
        title: "Reset Link Sent",
        description: "Check your email for password reset instructions",
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            {isSubmitted 
              ? "We've sent you a password reset link" 
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                If an account exists with <span className="font-semibold">{email}</span>, you will receive a password reset link shortly.
              </p>
              <Button asChild className="w-full">
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <Button asChild variant="ghost" className="w-full">
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
