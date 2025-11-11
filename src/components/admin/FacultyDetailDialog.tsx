import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Calendar, MapPin, User, Briefcase, Hash, GraduationCap } from "lucide-react";

interface FacultyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty: any;
}

export function FacultyDetailDialog({ open, onOpenChange, faculty }: FacultyDetailDialogProps) {
  if (!faculty) return null;

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
            <DialogTitle className="text-2xl">Faculty Details</DialogTitle>
            <Badge variant={faculty.status === "Active" ? "default" : "secondary"}>
              {faculty.status}
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
              <InfoRow icon={Hash} label="Faculty ID" value={faculty.id} />
              <InfoRow icon={Hash} label="Employee ID" value={faculty.employeeId} />
              <InfoRow icon={User} label="Full Name" value={faculty.name} />
              <InfoRow icon={Mail} label="Email" value={faculty.email} />
              <InfoRow icon={Phone} label="Phone" value={faculty.phone} />
              <InfoRow icon={MapPin} label="Address" value={faculty.address} />
            </div>
          </div>

          <Separator />

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Professional Information
            </h3>
            <div className="space-y-1">
              <InfoRow icon={Briefcase} label="Department" value={faculty.department} />
              <InfoRow icon={GraduationCap} label="Qualification" value={faculty.qualification} />
              <InfoRow icon={Briefcase} label="Specialization" value={faculty.specialization} />
              <InfoRow icon={Calendar} label="Date of Joining" value={faculty.dateOfJoining} />
            </div>
          </div>

          <Separator />

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contact
            </h3>
            <div className="space-y-1">
              <InfoRow icon={User} label="Contact Name" value={faculty.emergencyContactName} />
              <InfoRow icon={Phone} label="Contact Phone" value={faculty.emergencyContact} />
            </div>
          </div>

          {/* Teaching Statistics (Mock data) */}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">Teaching Overview</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">5</p>
                <p className="text-sm text-muted-foreground">Active Courses</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">120</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">4.5</p>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
