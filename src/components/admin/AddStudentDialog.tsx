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

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (student: any) => void;
}

export function AddStudentDialog({ open, onOpenChange, onSubmit }: AddStudentDialogProps) {
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.enrollmentNumber || !formData.course || !formData.year) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      ...formData,
      id: `S${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: "Active",
    });

    // Reset form
    setFormData({
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
    });

    toast({
      title: "Success",
      description: "Student added successfully",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Fill in the student information below. Fields marked with * are required.
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
                placeholder="John Doe"
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
                placeholder="john@example.com"
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
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
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

            {/* Academic Information */}
            <div className="col-span-2 pt-4">
              <h3 className="text-sm font-semibold mb-3">Academic Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrollment">Enrollment Number *</Label>
              <Input
                id="enrollment"
                value={formData.enrollmentNumber}
                onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                placeholder="EN2024001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Select
                value={formData.course}
                onValueChange={(value) => setFormData({ ...formData, course: value })}
              >
                <SelectTrigger id="course" className="bg-background">
                  <SelectValue placeholder="Select course" />
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
              <Label htmlFor="year">Year *</Label>
              <Select
                value={formData.year}
                onValueChange={(value) => setFormData({ ...formData, year: value })}
              >
                <SelectTrigger id="year" className="bg-background">
                  <SelectValue placeholder="Select year" />
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
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input
                id="guardianName"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                placeholder="Guardian Full Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianPhone">Guardian Phone</Label>
              <Input
                id="guardianPhone"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Student</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
