import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFaculty } from "@/hooks/useFaculty";
import { courseSchema } from "@/lib/validations";

interface AddCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (courseData: any) => void;
}

export function AddCourseDialog({ open, onOpenChange, onAdd }: AddCourseDialogProps) {
  const { toast } = useToast();
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validation = courseSchema.safeParse({
      course_code: formData.course_code,
      course_name: formData.course_name,
      description: formData.description || undefined,
      credits: formData.credits ? parseInt(formData.credits) : 0,
      department: formData.department || undefined,
      semester: formData.semester ? parseInt(formData.semester) : 0,
      faculty_id: formData.faculty_id || undefined,
      status: formData.status,
    });

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
    setErrors({});
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>Create a new course and optionally assign a faculty member</DialogDescription>
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
            {errors.course_code && <p className="text-sm text-destructive">{errors.course_code}</p>}
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
            <Label htmlFor="faculty_id">Assign Faculty (Optional)</Label>
            <Select
              value={formData.faculty_id}
              onValueChange={(value) => setFormData({ ...formData, faculty_id: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={facultyLoading ? "Loading..." : "Select faculty member"} />
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
            {errors.faculty_id && <p className="text-sm text-destructive">{errors.faculty_id}</p>}
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
