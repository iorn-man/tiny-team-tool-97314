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
    code: "",
    name: "",
    credits: "",
    faculty: "",
    facultyId: "",
    semester: "",
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
    
    if (!formData.code || !formData.name || !formData.credits || !formData.facultyId || !formData.semester) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedFaculty = facultyList.find(f => f.id === formData.facultyId);
    
    onAdd({
      ...formData,
      credits: parseInt(formData.credits),
      faculty: selectedFaculty?.name || "",
    });

    toast({
      title: "Course Added",
      description: `${formData.name} has been added successfully`,
    });

    setFormData({
      code: "",
      name: "",
      credits: "",
      faculty: "",
      facultyId: "",
      semester: "",
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
            <Label htmlFor="code">Course Code *</Label>
            <Input
              id="code"
              placeholder="e.g., CS101"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Course Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Introduction to Programming"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
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
            <Label htmlFor="faculty">Assign Faculty *</Label>
            <Select
              value={formData.facultyId}
              onValueChange={(value) => setFormData({ ...formData, facultyId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select faculty" />
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
            <Label htmlFor="semester">Semester *</Label>
            <Input
              id="semester"
              placeholder="e.g., Fall 2024"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              required
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
