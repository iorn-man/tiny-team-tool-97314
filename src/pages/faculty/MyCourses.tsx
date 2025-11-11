import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyCourses = () => {
  const navigate = useNavigate();

  // Mock course data
  const courses = [
    {
      id: 1,
      code: "CS101",
      name: "Introduction to Programming",
      department: "Computer Science",
      semester: "Fall 2025",
      credits: 4,
      students: 45,
      schedule: "Mon, Wed, Fri 10:00 AM - 11:30 AM",
      room: "Room 301",
      status: "active",
    },
    {
      id: 2,
      code: "CS201",
      name: "Data Structures",
      department: "Computer Science",
      semester: "Fall 2025",
      credits: 4,
      students: 38,
      schedule: "Tue, Thu 2:00 PM - 3:30 PM",
      room: "Room 205",
      status: "active",
    },
    {
      id: 3,
      code: "CS301",
      name: "Database Systems",
      department: "Computer Science",
      semester: "Fall 2025",
      credits: 3,
      students: 32,
      schedule: "Mon, Wed 1:00 PM - 2:30 PM",
      room: "Room 402",
      status: "active",
    },
  ];

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Manage your assigned courses</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{course.code}</CardTitle>
                    <CardDescription className="mt-1">{course.name}</CardDescription>
                  </div>
                  <Badge variant="default">{course.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.students} Students Enrolled</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{course.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{course.room}</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/faculty/attendance")}
                  >
                    Mark Attendance
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/faculty/grades")}
                  >
                    Enter Grades
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No courses assigned yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyCourses;
