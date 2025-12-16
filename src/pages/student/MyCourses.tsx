import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User, Clock, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface EnrolledCourse {
  id: string;
  course_code: string;
  course_name: string;
  department: string | null;
  credits: number;
  status: string | null;
  enrollment_status: string | null;
  faculty_name: string | null;
  attendance_percentage: number;
  grade_percentage: number;
}

const MyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) return;

      // Get student record
      const { data: studentData } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!studentData) {
        setLoading(false);
        return;
      }

      // Get enrollments with course details
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`
          id,
          status,
          course_id,
          courses:course_id (
            id,
            course_code,
            course_name,
            department,
            credits,
            status,
            faculty_id,
            faculties:faculty_id (
              full_name
            )
          )
        `)
        .eq("student_id", studentData.id);

      if (!enrollments) {
        setLoading(false);
        return;
      }

      // Fetch attendance and grades for each course
      const coursesWithStats = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = enrollment.courses as any;
          if (!course) return null;

          // Get attendance
          const { data: attendance } = await supabase
            .from("attendance")
            .select("status")
            .eq("student_id", studentData.id)
            .eq("course_id", course.id);

          const presentCount = attendance?.filter(a => a.status === "present").length || 0;
          const totalAttendance = attendance?.length || 0;
          const attendancePercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

          // Get grades
          const { data: grades } = await supabase
            .from("grades")
            .select("percentage")
            .eq("student_id", studentData.id)
            .eq("course_id", course.id);

          const gradePercentage = grades && grades.length > 0
            ? grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length
            : 0;

          return {
            id: course.id,
            course_code: course.course_code,
            course_name: course.course_name,
            department: course.department,
            credits: course.credits,
            status: course.status,
            enrollment_status: enrollment.status,
            faculty_name: course.faculties?.full_name || null,
            attendance_percentage: Math.round(attendancePercentage),
            grade_percentage: Math.round(gradePercentage),
          };
        })
      );

      setCourses(coursesWithStats.filter(Boolean) as EnrolledCourse[]);
      setLoading(false);
    };

    fetchEnrolledCourses();
  }, [user]);

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 85) return "A";
    if (percentage >= 80) return "A-";
    if (percentage >= 75) return "B+";
    if (percentage >= 70) return "B";
    if (percentage >= 65) return "B-";
    if (percentage >= 60) return "C+";
    if (percentage >= 55) return "C";
    if (percentage >= 50) return "C-";
    return "F";
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">View your enrolled courses and performance</p>
        </div>

        <div className="grid gap-6">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{course.course_code}</CardTitle>
                      <Badge variant="default">{course.enrollment_status}</Badge>
                    </div>
                    <CardDescription className="mt-1">{course.course_name}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{course.grade_percentage > 0 ? getGradeLetter(course.grade_percentage) : "-"}</p>
                    <p className="text-xs text-muted-foreground">Current Grade</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {course.faculty_name && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{course.faculty_name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.department} • {course.credits} Credits</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Attendance</span>
                        <span className={`text-sm font-bold ${getAttendanceColor(course.attendance_percentage)}`}>
                          {course.attendance_percentage}%
                        </span>
                      </div>
                      <Progress value={course.attendance_percentage} className="h-2" />
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Grade Progress</p>
                        <p className="text-xs text-muted-foreground">{course.grade_percentage}% average</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No courses enrolled yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyCourses;
