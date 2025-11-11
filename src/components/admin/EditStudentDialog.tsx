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

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: any;
  onSubmit: (student: any) => void;
}

export function EditStudentDialog({ open, onOpenChange, student, onSubmit }: EditStudentDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    enrollmentNumber: "",
    course: "",
    year: "",
    dateOfBirth: "",
    address: "",
    guardianName: "",
    guardianPhone: "",
    status: "Active",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        enrollmentNumber: student.enrollmentNumber || "",
        course: student.course || "",
        year: student.year || "",
        dateOfBirth: student.dateOfBirth || "",
        address: student.address || "",
        guardianName: student.guardianName || "",
        guardianPhone: student.guardianPhone || "",
        status: student.status || "Active",
      });
    }
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.enrollmentNumber || !formData.course || !formData.year) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      ...student,
      ...formData,
    });

    toast({
      title: "Success",
      description: "Student updated successfully",
    });

    onOpenChange(false);
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update student information. Fields marked with * are required.
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
              <Label htmlFor="edit-dob">Date of Birth</Label>
              <Input
                id="edit-dob"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
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

            {/* Academic Information */}
            <div className="col-span-2 pt-4">
              <h3 className="text-sm font-semibold mb-3">Academic Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-enrollment">Enrollment Number *</Label>
              <Input
                id="edit-enrollment"
                value={formData.enrollmentNumber}
                onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                required
              />
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
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-course">Course *</Label>
              <Select
                value={formData.course}
                onValueChange={(value) => setFormData({ ...formData, course: value })}
              >
                <SelectTrigger id="edit-course" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-year">Year *</Label>
              <Select
                value={formData.year}
                onValueChange={(value) => setFormData({ ...formData, year: value })}
              >
                <SelectTrigger id="edit-year" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="1st Year">1st Year</SelectItem>
                  <SelectItem value="2nd Year">2nd Year</SelectItem>
                  <SelectItem value="3rd Year">3rd Year</SelectItem>
                  <SelectItem value="4th Year">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Guardian Information */}
            <div className="col-span-2 pt-4">
              <h3 className="text-sm font-semibold mb-3">Guardian Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-guardianName">Guardian Name</Label>
              <Input
                id="edit-guardianName"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-guardianPhone">Guardian Phone</Label>
              <Input
                id="edit-guardianPhone"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
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
