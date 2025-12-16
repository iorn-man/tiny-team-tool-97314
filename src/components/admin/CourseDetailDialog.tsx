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
              <p className="font-semibold">{course.course_code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Course Name</p>
              <p className="font-semibold">{course.course_name}</p>
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
              <p className="font-semibold">{course.semester || "N/A"}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-semibold">{course.department || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={course.status === "active" ? "default" : "secondary"}>
                {course.status || "active"}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-2">Description</p>
            <p className="text-sm">
              {course.description || `This course provides comprehensive coverage of ${course.course_name?.toLowerCase() || "the subject"}. Students will gain practical knowledge and skills essential for their academic and professional development.`}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
