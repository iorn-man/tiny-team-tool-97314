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
import { Mail, Phone, Calendar, MapPin, User, GraduationCap, Hash } from "lucide-react";

interface StudentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: any;
}

export function StudentDetailDialog({ open, onOpenChange, student }: StudentDetailDialogProps) {
  // Fetch real statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["student-stats", student?.dbId],
    queryFn: async () => {
      if (!student?.dbId) return null;

      // Fetch attendance records
      const { data: attendance } = await supabase
        .from("attendance")
        .select("status")
        .eq("student_id", student.dbId);

      const totalAttendance = attendance?.length || 0;
      const presentCount = attendance?.filter(a => a.status === "present").length || 0;
      const attendancePercentage = totalAttendance > 0 
        ? ((presentCount / totalAttendance) * 100).toFixed(1) 
        : "0";

      // Fetch grades
      const { data: grades } = await supabase
        .from("grades")
        .select("percentage")
        .eq("student_id", student.dbId);

      const avgGrade = grades && grades.length > 0
        ? (grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length).toFixed(1)
        : "0";

      // Fetch enrolled courses
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id, courses(course_code, course_name)")
        .eq("student_id", student.dbId);

      return {
        attendancePercentage,
        avgGrade,
        coursesCount: enrollments?.length || 0,
        courses: enrollments?.map(e => e.courses) || [],
      };
    },
    enabled: open && !!student?.dbId,
  });

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
            <Badge variant={student.status === "Active" || student.status === "active" ? "default" : "secondary"}>
              {student.status}
            </Badge>
          </div>
          <DialogDescription>
            Viewing detailed information for {student.name || student.full_name}
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
              <InfoRow icon={Hash} label="Student ID" value={student.id || student.student_id} />
              <InfoRow icon={User} label="Full Name" value={student.name || student.full_name} />
              <InfoRow icon={Mail} label="Email" value={student.email} />
              <InfoRow icon={Phone} label="Phone" value={student.phone} />
              <InfoRow icon={Calendar} label="Date of Birth" value={student.dateOfBirth || student.date_of_birth} />
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
              <InfoRow icon={Hash} label="Enrollment Number" value={student.enrollmentNumber || student.student_id} />
              <InfoRow icon={Calendar} label="Enrollment Date" value={student.enrollment_date || student.enrollmentDate} />
              <InfoRow icon={User} label="Gender" value={student.gender} />
            </div>
          </div>

          {/* Academic Performance - Real Data */}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">Academic Performance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-primary">{stats?.attendancePercentage || "0"}%</p>
                )}
                <p className="text-sm text-muted-foreground">Attendance</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-primary">{stats?.avgGrade || "0"}%</p>
                )}
                <p className="text-sm text-muted-foreground">Avg. Grade</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-primary">{stats?.coursesCount || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Courses</p>
              </div>
            </div>

            {stats?.courses && stats.courses.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Enrolled Courses:</p>
                <div className="flex flex-wrap gap-2">
                  {stats.courses.map((course: any, i: number) => (
                    <Badge key={i} variant="outline">
                      {course?.course_code} - {course?.course_name}
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
