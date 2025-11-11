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

interface DeleteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: any;
  onConfirm: (studentId: string) => void;
}

export function DeleteStudentDialog({ open, onOpenChange, student, onConfirm }: DeleteStudentDialogProps) {
  const { toast } = useToast();

  const handleConfirm = () => {
    onConfirm(student.id);
    toast({
      title: "Student Deleted",
      description: `${student.name} has been removed from the system`,
      variant: "destructive",
    });
    onOpenChange(false);
  };

  if (!student) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <span className="font-semibold">{student.name}</span> (ID: {student.id}) from the system.
            This action cannot be undone and will remove all associated records including:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Enrollment records</li>
              <li>Attendance history</li>
              <li>Grade records</li>
              <li>All personal information</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90">
            Delete Student
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
