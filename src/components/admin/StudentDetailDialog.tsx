import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Calendar, MapPin, User, GraduationCap, Hash } from "lucide-react";

interface StudentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: any;
}

export function StudentDetailDialog({ open, onOpenChange, student }: StudentDetailDialogProps) {
  if (!student) return null;

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || "Not provided"}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Student Details</DialogTitle>
            <Badge variant={student.status === "Active" ? "default" : "secondary"}>
              {student.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h3>
            <div className="space-y-1">
              <InfoRow icon={Hash} label="Student ID" value={student.id} />
              <InfoRow icon={User} label="Full Name" value={student.name} />
              <InfoRow icon={Mail} label="Email" value={student.email} />
              <InfoRow icon={Phone} label="Phone" value={student.phone} />
              <InfoRow icon={Calendar} label="Date of Birth" value={student.dateOfBirth} />
              <InfoRow icon={MapPin} label="Address" value={student.address} />
            </div>
          </div>

          <Separator />

          {/* Academic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Academic Information
            </h3>
            <div className="space-y-1">
              <InfoRow icon={Hash} label="Enrollment Number" value={student.enrollmentNumber} />
              <InfoRow icon={GraduationCap} label="Course" value={student.course} />
              <InfoRow icon={Calendar} label="Year" value={student.year} />
            </div>
          </div>

          <Separator />

          {/* Guardian Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Guardian Information
            </h3>
            <div className="space-y-1">
              <InfoRow icon={User} label="Guardian Name" value={student.guardianName} />
              <InfoRow icon={Phone} label="Guardian Phone" value={student.guardianPhone} />
            </div>
          </div>

          {/* Additional Statistics (Mock data) */}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">Academic Performance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">85%</p>
                <p className="text-sm text-muted-foreground">Attendance</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">3.8</p>
                <p className="text-sm text-muted-foreground">GPA</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">5</p>
                <p className="text-sm text-muted-foreground">Courses</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
