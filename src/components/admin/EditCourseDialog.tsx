import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFaculty } from "@/hooks/useFaculty";

interface EditCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: any;
  onEdit: (courseData: any) => void;
}

export function EditCourseDialog({ open, onOpenChange, course, onEdit }: EditCourseDialogProps) {
  const { faculty: facultyList, isLoading: facultyLoading } = useFaculty();
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

  useEffect(() => {
    if (course) {
      setFormData({
        course_code: course.course_code || "",
        course_name: course.course_name || "",
        description: course.description || "",
        credits: String(course.credits || ""),
        department: course.department || "",
        semester: String(course.semester || ""),
        faculty_id: course.faculty_id || "",
        status: course.status || "active",
      });
    }
  }, [course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onEdit({
      course_code: formData.course_code,
      course_name: formData.course_name,
      description: formData.description || null,
      credits: parseInt(formData.credits) || 0,
      department: formData.department || null,
      semester: parseInt(formData.semester) || null,
      faculty_id: formData.faculty_id || null,
      status: formData.status,
    });

    onOpenChange(false);
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>Update course details and faculty assignment</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-code">Course Code</Label>
            <Input
              id="edit-code"
              value={formData.course_code}
              onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Course Name</Label>
            <Input
              id="edit-name"
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-credits">Credits</Label>
            <Input
              id="edit-credits"
              type="number"
              min="1"
              max="6"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-department">Department</Label>
            <Input
              id="edit-department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-semester">Semester</Label>
            <Input
              id="edit-semester"
              type="number"
              min="1"
              max="8"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-faculty">Assign Faculty</Label>
            <Select
              value={formData.faculty_id}
              onValueChange={(value) => setFormData({ ...formData, faculty_id: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={facultyLoading ? "Loading..." : "Select faculty"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {facultyList.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.full_name} ({faculty.faculty_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
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
            <Button type="submit">Update Course</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
