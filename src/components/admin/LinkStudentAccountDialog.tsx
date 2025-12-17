import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Link } from "lucide-react";

interface LinkStudentAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: {
    id: string;
    full_name: string;
    email: string;
    student_id: string;
    user_id?: string | null;
  } | null;
  onSuccess: () => void;
}

export function LinkStudentAccountDialog({
  open,
  onOpenChange,
  student,
  onSuccess,
}: LinkStudentAccountDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !password) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: student.email,
          password: password,
          fullName: student.full_name,
          role: "student",
          recordId: student.id,
        },
      });

      if (error) throw error;

      toast({
        title: "Account Linked",
        description: `Login credentials created for ${student.full_name}`,
      });

      setPassword("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Link Student Account
          </DialogTitle>
          <DialogDescription>
            Create login credentials for this student so they can access the student portal.
          </DialogDescription>
        </DialogHeader>

        {student && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <p className="text-sm font-medium">{student.full_name}</p>
              <p className="text-xs text-muted-foreground">{student.student_id}</p>
            </div>

            <div className="space-y-2">
              <Label>Email (Login ID)</Label>
              <Input value={student.email} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password for the student"
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 6 characters. Share this password with the student.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !password}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
