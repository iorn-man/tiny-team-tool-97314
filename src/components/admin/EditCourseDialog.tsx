import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface EditCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: any;
  onEdit: (courseData: any) => void;
}

export function EditCourseDialog({ open, onOpenChange, course, onEdit }: EditCourseDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    credits: "",
    facultyId: "",
    semester: "",
    status: "active",
  });

  const facultyList = [
    { id: "F001", name: "Dr. John Smith" },
    { id: "F002", name: "Dr. Sarah Johnson" },
    { id: "F003", name: "Prof. Michael Brown" },
  ];

  useEffect(() => {
    if (course) {
      setFormData({
        code: course.code,
        name: course.name,
        credits: String(course.credits),
        facultyId: course.facultyId,
        semester: course.semester,
        status: course.status,
      });
    }
  }, [course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedFaculty = facultyList.find(f => f.id === formData.facultyId);
    
    onEdit({
      ...formData,
      credits: parseInt(formData.credits),
      faculty: selectedFaculty?.name || "",
    });

    toast({
      title: "Course Updated",
      description: `${formData.name} has been updated successfully`,
    });

    onOpenChange(false);
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-code">Course Code</Label>
            <Input
              id="edit-code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Course Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
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
            <Label htmlFor="edit-faculty">Assign Faculty</Label>
            <Select
              value={formData.facultyId}
              onValueChange={(value) => setFormData({ ...formData, facultyId: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {facultyList.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-semester">Semester</Label>
            <Input
              id="edit-semester"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              required
            />
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
