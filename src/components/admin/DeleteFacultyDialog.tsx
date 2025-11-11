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

interface DeleteFacultyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty: any;
  onConfirm: (facultyId: string) => void;
}

export function DeleteFacultyDialog({ open, onOpenChange, faculty, onConfirm }: DeleteFacultyDialogProps) {
  const { toast } = useToast();

  const handleConfirm = () => {
    onConfirm(faculty.id);
    toast({
      title: "Faculty Deleted",
      description: `${faculty.name} has been removed from the system`,
      variant: "destructive",
    });
    onOpenChange(false);
  };

  if (!faculty) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <span className="font-semibold">{faculty.name}</span> (ID: {faculty.id}) from the system.
            This action cannot be undone and will remove all associated records including:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Course assignments</li>
              <li>Attendance records</li>
              <li>Grade entries</li>
              <li>All personal information</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90">
            Delete Faculty
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
