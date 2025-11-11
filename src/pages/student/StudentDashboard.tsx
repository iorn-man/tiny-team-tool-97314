import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { BookOpen, Calendar, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useAuth } from "@/contexts/AuthContext";
import { useStudents } from "@/hooks/useStudents";
import { useAttendance } from "@/hooks/useAttendance";
import { useGrades } from "@/hooks/useGrades";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useCourses } from "@/hooks/useCourses";
import { format } from "date-fns";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { students } = useStudents();
  const currentStudent = students.find(s => s.user_id === user?.id);
  
  const { enrollments } = useEnrollments();
  const { courses } = useCourses();
  const { attendance } = useAttendance(undefined, undefined);
  const { grades } = useGrades(undefined, currentStudent?.id);
  const { announcements } = useAnnouncements();

  const myEnrollments = enrollments.filter(e => e.student_id === currentStudent?.id);
  const myAttendance = attendance.filter(a => a.student_id === currentStudent?.id);
  
  const attendancePercentage = myAttendance.length > 0
    ? (myAttendance.filter(a => a.status === "present").length / myAttendance.length) * 100
    : 0;

  const averageGrade = grades.length > 0
    ? grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length
    : 0;

  const stats = [
    { title: "Enrolled Courses", value: myEnrollments.length.toString(), icon: BookOpen },
    { title: "Attendance", value: `${Math.round(attendancePercentage)}%`, icon: Calendar },
    { title: "Average Grade", value: `${Math.round(averageGrade)}%`, icon: Award },
    { title: "Announcements", value: announcements.length.toString(), icon: TrendingUp },
  ];

  const recentAnnouncements = announcements.slice(0, 5);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your academic overview.</p>
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
                {myEnrollments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No courses enrolled yet</p>
                ) : (
                  myEnrollments.map((enrollment) => {
                    const course = courses.find(c => c.id === enrollment.course_id);
                    const courseGrades = grades.filter(g => g.course_id === enrollment.course_id);
                    const courseAvg = courseGrades.length > 0
                      ? courseGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / courseGrades.length
                      : 0;

                    return (
                      <div key={enrollment.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <BookOpen className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1">
                          <p className="font-medium">{course?.course_name || "Unknown Course"}</p>
                          <p className="text-sm text-muted-foreground">{course?.course_code}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={courseAvg} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground">{Math.round(courseAvg)}%</span>
                          </div>
                        </div>
                        <Badge variant="outline">{enrollment.status}</Badge>
                      </div>
                    );
                  })
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
