import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { BookOpen, Calendar, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const StudentDashboard = () => {
  const stats = [
    { title: "Enrolled Courses", value: "8", icon: BookOpen },
    { title: "Attendance", value: "92%", icon: Calendar },
    { title: "Overall Grade", value: "A", icon: Award },
    { title: "Assignments Due", value: "3", icon: TrendingUp },
  ];

  const enrolledCourses = [
    { name: "Data Structures", attendance: 95, grade: "A", faculty: "Dr. Smith" },
    { name: "Algorithms", attendance: 88, grade: "B+", faculty: "Prof. Johnson" },
    { name: "Database Systems", attendance: 92, grade: "A-", faculty: "Dr. Williams" },
  ];

  const recentAnnouncements = [
    { title: "Midterm Exam Schedule", date: "2 days ago", course: "Data Structures" },
    { title: "Assignment Deadline Extended", date: "3 days ago", course: "Algorithms" },
    { title: "Guest Lecture on AI", date: "1 week ago", course: "General" },
  ];

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
                {enrolledCourses.map((course, index) => (
                  <div key={index} className="space-y-2 pb-4 border-b last:border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{course.name}</p>
                        <p className="text-xs text-muted-foreground">{course.faculty}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {course.grade}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Attendance</span>
                        <span>{course.attendance}%</span>
                      </div>
                      <Progress value={course.attendance} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>Latest updates from your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAnnouncements.map((announcement, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{announcement.title}</p>
                      <p className="text-xs text-muted-foreground">{announcement.course}</p>
                      <p className="text-xs text-muted-foreground">{announcement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
