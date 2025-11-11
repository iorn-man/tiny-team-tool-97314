import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface DeleteCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: any;
  onConfirm: (courseId: string) => void;
}

export function DeleteCourseDialog({ open, onOpenChange, course, onConfirm }: DeleteCourseDialogProps) {
  const { toast } = useToast();

  const handleConfirm = () => {
    onConfirm(course.id);
    toast({
      title: "Course Deleted",
      description: `${course.name} has been removed from the system`,
      variant: "destructive",
    });
    onOpenChange(false);
  };

  if (!course) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <span className="font-semibold">{course.name}</span> ({course.code}) from the system.
            This action cannot be undone and will remove:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>All student enrollments ({course.enrolledStudents} students)</li>
              <li>Attendance records</li>
              <li>Grade entries</li>
              <li>Course materials</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90">
            Delete Course
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
