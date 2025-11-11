import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (courseData: any) => void;
}

export function AddCourseDialog({ open, onOpenChange, onAdd }: AddCourseDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    course_code: "",
    course_name: "",
    description: "",
    credits: "",
    department: "",
    semester: "",
    faculty_id: "",
    status: "active",
  });

  // Mock faculty data
  const facultyList = [
    { id: "F001", name: "Dr. John Smith" },
    { id: "F002", name: "Dr. Sarah Johnson" },
    { id: "F003", name: "Prof. Michael Brown" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.course_code || !formData.course_name || !formData.credits || !formData.semester) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    onAdd({
      course_code: formData.course_code,
      course_name: formData.course_name,
      description: formData.description || null,
      credits: parseInt(formData.credits),
      department: formData.department || null,
      semester: parseInt(formData.semester),
      faculty_id: formData.faculty_id || null,
      status: formData.status,
    });

    setFormData({
      course_code: "",
      course_name: "",
      description: "",
      credits: "",
      department: "",
      semester: "",
      faculty_id: "",
      status: "active",
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course_code">Course Code *</Label>
            <Input
              id="course_code"
              placeholder="e.g., CS101"
              value={formData.course_code}
              onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course_name">Course Name *</Label>
            <Input
              id="course_name"
              placeholder="e.g., Introduction to Programming"
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Course description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credits">Credits *</Label>
            <Input
              id="credits"
              type="number"
              min="1"
              max="6"
              placeholder="e.g., 3"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="e.g., Computer Science"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="semester">Semester (1-8) *</Label>
            <Input
              id="semester"
              type="number"
              min="1"
              max="8"
              placeholder="e.g., 1"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faculty_id">Faculty ID (Optional)</Label>
            <Input
              id="faculty_id"
              placeholder="Faculty UUID"
              value={formData.faculty_id}
              onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Course</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
