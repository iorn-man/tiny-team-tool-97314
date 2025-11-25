import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { usePlacementCompanies } from "@/hooks/usePlacementCompanies";
import { Checkbox } from "@/components/ui/checkbox";

interface AddScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BRANCHES = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical"];

export const AddScheduleDialog = ({ open, onOpenChange }: AddScheduleDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: companies } = usePlacementCompanies();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      company_id: formData.get("company_id") as string,
      drive_date: formData.get("drive_date") as string,
      drive_time: formData.get("drive_time") as string,
      venue: formData.get("venue") as string,
      eligible_branches: selectedBranches,
      min_cgpa: parseFloat(formData.get("min_cgpa") as string),
      description: formData.get("description") as string,
      status: "scheduled",
    };

    const { error } = await supabase.from("placement_schedule").insert([data]);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Placement drive scheduled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["placement-schedule"] });
      onOpenChange(false);
    }

    setIsLoading(false);
  };

  const toggleBranch = (branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Placement Drive</DialogTitle>
          <DialogDescription>Schedule a new placement drive for a company</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="drive_date">Drive Date *</Label>
              <Input id="drive_date" name="drive_date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drive_time">Drive Time *</Label>
              <Input id="drive_time" name="drive_time" type="time" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue *</Label>
            <Input id="venue" name="venue" required />
          </div>

          <div className="space-y-2">
            <Label>Eligible Branches *</Label>
            <div className="grid grid-cols-2 gap-2">
              {BRANCHES.map((branch) => (
                <div key={branch} className="flex items-center space-x-2">
                  <Checkbox
                    id={branch}
                    checked={selectedBranches.includes(branch)}
                    onCheckedChange={() => toggleBranch(branch)}
                  />
                  <label htmlFor={branch} className="text-sm cursor-pointer">
                    {branch}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_cgpa">Minimum CGPA *</Label>
            <Input id="min_cgpa" name="min_cgpa" type="number" step="0.1" min="0" max="10" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Schedule Drive"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
