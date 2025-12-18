import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Users, BookOpen } from "lucide-react";

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
          <DialogDescription>
            View detailed information about this course
          </DialogDescription>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Assigned Faculty</p>
                {course.faculty ? (
                  <div>
                    <p className="font-semibold">{course.faculty.full_name}</p>
                    <p className="text-sm text-muted-foreground">{course.faculty.email}</p>
                    {course.faculty.department && (
                      <p className="text-sm text-muted-foreground">{course.faculty.department}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Not Assigned</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Enrolled Students</p>
                <p className="font-semibold">{course.enrolled_count || 0} students</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Description</p>
            </div>
            <p className="text-sm">
              {course.description || `This course provides comprehensive coverage of ${course.course_name?.toLowerCase() || "the subject"}. Students will gain practical knowledge and skills essential for their academic and professional development.`}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
