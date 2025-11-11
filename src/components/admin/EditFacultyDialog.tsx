import { useState, useEffect } from "react";
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

interface EditFacultyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty: any;
  onSubmit: (faculty: any) => void;
}

export function EditFacultyDialog({ open, onOpenChange, faculty, onSubmit }: EditFacultyDialogProps) {
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
    status: "Active",
  });

  useEffect(() => {
    if (faculty) {
      setFormData({
        name: faculty.name || "",
        email: faculty.email || "",
        phone: faculty.phone || "",
        employeeId: faculty.employeeId || "",
        department: faculty.department || "",
        qualification: faculty.qualification || "",
        specialization: faculty.specialization || "",
        dateOfJoining: faculty.dateOfJoining || "",
        address: faculty.address || "",
        emergencyContact: faculty.emergencyContact || "",
        emergencyContactName: faculty.emergencyContactName || "",
        status: faculty.status || "Active",
      });
    }
  }, [faculty]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.employeeId || !formData.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      ...faculty,
      ...formData,
    });

    toast({
      title: "Success",
      description: "Faculty member updated successfully",
    });

    onOpenChange(false);
  };

  if (!faculty) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>Edit Faculty Member</DialogTitle>
          <DialogDescription>
            Update faculty information. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="col-span-2">
              <h3 className="text-sm font-semibold mb-3">Personal Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-employeeId">Employee ID *</Label>
              <Input
                id="edit-employeeId"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            {/* Professional Information */}
            <div className="col-span-2 pt-4">
              <h3 className="text-sm font-semibold mb-3">Professional Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger id="edit-department" className="bg-background">
                  <SelectValue />
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
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="edit-status" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-qualification">Highest Qualification</Label>
              <Select
                value={formData.qualification}
                onValueChange={(value) => setFormData({ ...formData, qualification: value })}
              >
                <SelectTrigger id="edit-qualification" className="bg-background">
                  <SelectValue />
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
              <Label htmlFor="edit-specialization">Specialization</Label>
              <Input
                id="edit-specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-dateOfJoining">Date of Joining</Label>
              <Input
                id="edit-dateOfJoining"
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
              <Label htmlFor="edit-emergencyContactName">Contact Name</Label>
              <Input
                id="edit-emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-emergencyContact">Contact Phone</Label>
              <Input
                id="edit-emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
