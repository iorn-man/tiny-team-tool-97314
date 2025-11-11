import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { BookOpen, Users, UserCheck, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCourses } from "@/hooks/useCourses";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useAuth } from "@/contexts/AuthContext";
import { useFaculty } from "@/hooks/useFaculty";

const FacultyDashboard = () => {
  const { user } = useAuth();
  const { faculty } = useFaculty();
  const { courses } = useCourses();
  const { enrollments } = useEnrollments();

  const currentFaculty = faculty.find(f => f.user_id === user?.id);
  const myCourses = courses.filter(c => c.faculty_id === currentFaculty?.id);
  const myEnrollments = enrollments.filter(e => 
    myCourses.some(course => course.id === e.course_id)
  );

  const stats = [
    { title: "My Courses", value: myCourses.length.toString(), icon: BookOpen },
    { title: "Total Students", value: myEnrollments.length.toString(), icon: Users },
    { title: "Active Enrollments", value: myEnrollments.filter(e => e.status === "enrolled").length.toString(), icon: UserCheck },
    { title: "Total Faculty", value: faculty.length.toString(), icon: FileText },
  ];

  const todayClasses = [
    { course: "Data Structures", time: "09:00 AM - 10:30 AM", room: "Lab 101" },
    { course: "Algorithms", time: "11:00 AM - 12:30 PM", room: "Room 204" },
    { course: "Database Systems", time: "02:00 PM - 03:30 PM", room: "Room 305" },
  ];

  const pendingTasks = [
    { task: "Submit midterm grades for Data Structures", priority: "High" },
    { task: "Review assignment submissions for Algorithms", priority: "Medium" },
    { task: "Prepare quiz for Database Systems", priority: "Low" },
  ];

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Professor! Here's your schedule today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Classes</CardTitle>
              <CardDescription>Your schedule for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayClasses.map((cls, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <Calendar className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <p className="font-medium">{cls.course}</p>
                      <p className="text-sm text-muted-foreground">{cls.time}</p>
                      <p className="text-xs text-muted-foreground">{cls.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks.map((item, index) => (
                  <div key={index} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm flex-1">{item.task}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.priority === "High" ? "bg-destructive/10 text-destructive" :
                        item.priority === "Medium" ? "bg-warning/10 text-warning" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {item.priority}
                      </span>
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

export default FacultyDashboard;
