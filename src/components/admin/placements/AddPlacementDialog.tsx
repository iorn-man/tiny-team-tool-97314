import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { usePlacementCompanies } from "@/hooks/usePlacementCompanies";
import { useStudents } from "@/hooks/useStudents";

interface AddPlacementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddPlacementDialog = ({ open, onOpenChange }: AddPlacementDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: companies } = usePlacementCompanies();
  const { students } = useStudents();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      student_id: formData.get("student_id") as string,
      company_id: formData.get("company_id") as string,
      position: formData.get("position") as string,
      package_offered: parseFloat(formData.get("package_offered") as string),
      placement_date: formData.get("placement_date") as string,
      status: "placed",
    };

    const { error } = await supabase.from("student_placements").insert([data]);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Student placement recorded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["placed-students"] });
      onOpenChange(false);
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Student Placement</DialogTitle>
          <DialogDescription>Add a new placement record for a student</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student_id">Student *</Label>
            <Select name="student_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students?.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name} ({student.student_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_id">Company *</Label>
            <Select name="company_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies?.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input id="position" name="position" placeholder="e.g., Software Engineer" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="package_offered">Package Offered (LPA) *</Label>
              <Input id="package_offered" name="package_offered" type="number" step="0.1" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placement_date">Placement Date *</Label>
            <Input id="placement_date" name="placement_date" type="date" required />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Recording..." : "Record Placement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
