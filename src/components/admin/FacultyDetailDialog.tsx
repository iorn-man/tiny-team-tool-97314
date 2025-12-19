import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, Calendar, User, Briefcase, Hash, GraduationCap } from "lucide-react";

interface FacultyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty: any;
}

export function FacultyDetailDialog({ open, onOpenChange, faculty }: FacultyDetailDialogProps) {
  // Fetch real statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["faculty-stats", faculty?.dbId],
    queryFn: async () => {
      if (!faculty?.dbId) return null;

      // Fetch courses assigned to this faculty
      const { data: courses } = await supabase
        .from("courses")
        .select("id, course_code, course_name")
        .eq("faculty_id", faculty.dbId);

      const courseIds = courses?.map(c => c.id) || [];

      // Fetch enrollments for these courses
      let totalStudents = 0;
      if (courseIds.length > 0) {
        const { count } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .in("course_id", courseIds);
        totalStudents = count || 0;
      }

      return {
        coursesCount: courses?.length || 0,
        totalStudents,
        courses: courses || [],
      };
    },
    enabled: open && !!faculty?.dbId,
  });

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
            <Badge variant={faculty.status === "Active" || faculty.status === "active" ? "default" : "secondary"}>
              {faculty.status}
            </Badge>
          </div>
          <DialogDescription>
            Viewing detailed information for {faculty.name || faculty.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h3>
            <div className="space-y-1">
              <InfoRow icon={Hash} label="Faculty ID" value={faculty.id || faculty.faculty_id} />
              <InfoRow icon={Hash} label="Employee ID" value={faculty.employeeId || faculty.faculty_id} />
              <InfoRow icon={User} label="Full Name" value={faculty.name || faculty.full_name} />
              <InfoRow icon={Mail} label="Email" value={faculty.email} />
              <InfoRow icon={Phone} label="Phone" value={faculty.phone} />
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
              <InfoRow icon={Calendar} label="Date of Joining" value={faculty.dateOfJoining || faculty.joining_date} />
            </div>
          </div>

          {/* Teaching Statistics - Real Data */}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">Teaching Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 text-center">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-primary">{stats?.coursesCount || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Active Courses</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-primary">{stats?.totalStudents || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>

            {stats?.courses && stats.courses.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Assigned Courses:</p>
                <div className="flex flex-wrap gap-2">
                  {stats.courses.map((course: any, i: number) => (
                    <Badge key={i} variant="outline">
                      {course.course_code} - {course.course_name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
