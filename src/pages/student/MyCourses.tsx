import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User, Clock, Calendar, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const MyCourses = () => {
  // Mock course data
  const courses = [
    {
      id: 1,
      code: "CS101",
      name: "Introduction to Programming",
      instructor: "Dr. John Smith",
      department: "Computer Science",
      credits: 4,
      schedule: "Mon, Wed, Fri 10:00 AM - 11:30 AM",
      room: "Room 301",
      attendance: 92,
      grade: "A",
      status: "ongoing",
    },
    {
      id: 2,
      code: "CS201",
      name: "Data Structures",
      instructor: "Prof. Sarah Johnson",
      department: "Computer Science",
      credits: 4,
      schedule: "Tue, Thu 2:00 PM - 3:30 PM",
      room: "Room 205",
      attendance: 88,
      grade: "B+",
      status: "ongoing",
    },
    {
      id: 3,
      code: "MATH201",
      name: "Calculus II",
      instructor: "Dr. Michael Brown",
      department: "Mathematics",
      credits: 3,
      schedule: "Mon, Wed 1:00 PM - 2:30 PM",
      room: "Room 102",
      attendance: 95,
      grade: "A-",
      status: "ongoing",
    },
  ];

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-red-600";
  };

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
                      <CardTitle className="text-xl">{course.code}</CardTitle>
                      <Badge variant="default">{course.status}</Badge>
                    </div>
                    <CardDescription className="mt-1">{course.name}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{course.grade}</p>
                    <p className="text-xs text-muted-foreground">Current Grade</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{course.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.department} • {course.credits} Credits</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{course.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{course.room}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Attendance</span>
                        <span className={`text-sm font-bold ${getAttendanceColor(course.attendance)}`}>
                          {course.attendance}%
                        </span>
                      </div>
                      <Progress value={course.attendance} className="h-2" />
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Performance Trend</p>
                        <p className="text-xs text-muted-foreground">Improving steadily</p>
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
