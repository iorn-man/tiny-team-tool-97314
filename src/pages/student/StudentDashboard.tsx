import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { BookOpen, Calendar, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface StudentRecord {
  id: string;
  full_name: string;
}

interface EnrollmentWithCourse {
  id: string;
  course_id: string;
  status: string | null;
  course_name: string;
  course_code: string;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const { announcements } = useAnnouncements();
  const [currentStudent, setCurrentStudent] = useState<StudentRecord | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [averageGrade, setAverageGrade] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;

      // Get student record
      const { data: studentData } = await supabase
        .from("students")
        .select("id, full_name")
        .eq("user_id", user.id)
        .single();

      if (!studentData) {
        setLoading(false);
        return;
      }

      setCurrentStudent(studentData);

      // Get enrollments with course details
      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select(`
          id,
          course_id,
          status,
          courses:course_id (
            course_name,
            course_code
          )
        `)
        .eq("student_id", studentData.id);

      if (enrollmentData) {
        const mapped = enrollmentData.map(e => ({
          id: e.id,
          course_id: e.course_id,
          status: e.status,
          course_name: (e.courses as any)?.course_name || "Unknown",
          course_code: (e.courses as any)?.course_code || "",
        }));
        setEnrollments(mapped);
      }

      // Get attendance
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("status")
        .eq("student_id", studentData.id);

      if (attendanceData && attendanceData.length > 0) {
        const presentCount = attendanceData.filter(a => a.status === "present").length;
        setAttendancePercentage(Math.round((presentCount / attendanceData.length) * 100));
      }

      // Get grades
      const { data: gradesData } = await supabase
        .from("grades")
        .select("percentage")
        .eq("student_id", studentData.id);

      if (gradesData && gradesData.length > 0) {
        const avg = gradesData.reduce((sum, g) => sum + (g.percentage || 0), 0) / gradesData.length;
        setAverageGrade(Math.round(avg));
      }

      setLoading(false);
    };

    fetchStudentData();
  }, [user]);

  const stats = [
    { title: "Enrolled Courses", value: enrollments.length.toString(), icon: BookOpen },
    { title: "Attendance", value: `${attendancePercentage}%`, icon: Calendar },
    { title: "Average Grade", value: `${averageGrade}%`, icon: Award },
    { title: "Announcements", value: announcements.length.toString(), icon: TrendingUp },
  ];

  const recentAnnouncements = announcements.slice(0, 5);

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{currentStudent ? `, ${currentStudent.full_name}` : ""}! Here's your academic overview.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Your enrolled courses and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrollments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No courses enrolled yet</p>
                ) : (
                  enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <BookOpen className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1">
                        <p className="font-medium">{enrollment.course_name}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.course_code}</p>
                      </div>
                      <Badge variant="outline">{enrollment.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>Latest updates from your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAnnouncements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No announcements yet</p>
                ) : (
                  recentAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{announcement.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {announcement.content}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {announcement.priority}
                        </Badge>
                      </div>
                      {announcement.created_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(announcement.created_at), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
