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

interface AddFacultyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (faculty: any) => void;
}

export function AddFacultyDialog({ open, onOpenChange, onSubmit }: AddFacultyDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    employeeId: "",
    department: "",
    qualification: "",
    specialization: "",
    dateOfJoining: "",
    address: "",
    emergencyContact: "",
    emergencyContactName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.employeeId || !formData.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      ...formData,
      id: `F${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: "Active",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      employeeId: "",
      department: "",
      qualification: "",
      specialization: "",
      dateOfJoining: "",
      address: "",
      emergencyContact: "",
      emergencyContactName: "",
    });

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
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. John Doe"
                required
              />
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

            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="EMP2024001"
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street, City"
              />
            </div>

            {/* Professional Information */}
            <div className="col-span-2 pt-4">
              <h3 className="text-sm font-semibold mb-3">Professional Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
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

            <div className="space-y-2">
              <Label htmlFor="dateOfJoining">Date of Joining</Label>
              <Input
                id="dateOfJoining"
                type="date"
                value={formData.dateOfJoining}
                onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
              />
            </div>

            {/* Emergency Contact */}
            <div className="col-span-2 pt-4">
              <h3 className="text-sm font-semibold mb-3">Emergency Contact</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                placeholder="Emergency Contact Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contact Phone</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="+1234567890"
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
