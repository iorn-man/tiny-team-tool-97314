import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { facultySchema } from "@/lib/validations";

interface AddFacultyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (faculty: any) => void;
}

export function AddFacultyDialog({ open, onOpenChange, onSubmit }: AddFacultyDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    faculty_id: "",
    department: "",
    qualification: "",
    specialization: "",
    joining_date: "",
    status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validation = facultySchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast({
        title: "Validation Error",
        description: "Please check all required fields",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);

    // Reset form
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      faculty_id: "",
      department: "",
      qualification: "",
      specialization: "",
      joining_date: "",
      status: "active",
    });
    setErrors({});

    toast({
      title: "Success",
      description: "Faculty member added successfully",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>Add New Faculty Member</DialogTitle>
          <DialogDescription>
            Fill in the faculty information below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="col-span-2">
              <h3 className="text-sm font-semibold mb-3">Personal Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Dr. John Doe"
                required
              />
              {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@institute.edu"
                required
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty_id">Faculty ID *</Label>
              <Input
                id="faculty_id"
                value={formData.faculty_id}
                onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                placeholder="FAC2024001"
                required
              />
              {errors.faculty_id && <p className="text-sm text-destructive">{errors.faculty_id}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>

            {/* Professional Information */}
            <div className="col-span-2 pt-4">
              <h3 className="text-sm font-semibold mb-3">Professional Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger id="department" className="bg-background">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                </SelectContent>
              </Select>
              {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualification">Highest Qualification</Label>
              <Select
                value={formData.qualification}
                onValueChange={(value) => setFormData({ ...formData, qualification: value })}
              >
                <SelectTrigger id="qualification" className="bg-background">
                  <SelectValue placeholder="Select qualification" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="Ph.D.">Ph.D.</SelectItem>
                  <SelectItem value="M.Tech">M.Tech</SelectItem>
                  <SelectItem value="M.Sc">M.Sc</SelectItem>
                  <SelectItem value="M.E.">M.E.</SelectItem>
                  <SelectItem value="MBA">MBA</SelectItem>
                  <SelectItem value="B.Tech">B.Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., Machine Learning, Databases"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="joining_date">Date of Joining</Label>
              <Input
                id="joining_date"
                type="date"
                value={formData.joining_date}
                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Faculty</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
