import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CourseDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: any;
}

export function CourseDetailDialog({ open, onOpenChange, course }: CourseDetailDialogProps) {
  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Course Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Course Code</p>
              <p className="font-semibold">{course.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Course Name</p>
              <p className="font-semibold">{course.name}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Credits</p>
              <p className="font-semibold">{course.credits}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Semester</p>
              <p className="font-semibold">{course.semester}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">Assigned Faculty</p>
            <p className="font-semibold">{course.faculty}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Enrolled Students</p>
              <p className="font-semibold">{course.enrolledStudents}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={course.status === "active" ? "default" : "secondary"}>
                {course.status}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-2">Description</p>
            <p className="text-sm">
              This course provides comprehensive coverage of {course.name.toLowerCase()}. 
              Students will gain practical knowledge and skills essential for their academic and professional development.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
