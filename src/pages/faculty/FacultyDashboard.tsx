import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { BookOpen, Users, UserCheck, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCourses } from "@/hooks/useCourses";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useAnnouncements } from "@/hooks/useAnnouncements";

interface FacultyRecord {
  id: string;
  full_name: string;
}

const FacultyDashboard = () => {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { enrollments } = useEnrollments();
  const { announcements } = useAnnouncements();
  const [currentFaculty, setCurrentFaculty] = useState<FacultyRecord | null>(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("faculties")
        .select("id, full_name")
        .eq("user_id", user.id)
        .single();
      
      if (data) {
        setCurrentFaculty(data);
      }
    };
    fetchFaculty();
  }, [user]);

  const myCourses = currentFaculty 
    ? courses.filter(c => c.faculty_id === currentFaculty.id) 
    : [];
  
  const myEnrollments = enrollments.filter(e => 
    myCourses.some(course => course.id === e.course_id)
  );

  const uniqueStudentIds = new Set(myEnrollments.map(e => e.student_id));

  const stats = [
    { title: "My Courses", value: myCourses.length.toString(), icon: BookOpen },
    { title: "Total Students", value: uniqueStudentIds.size.toString(), icon: Users },
    { title: "Active Enrollments", value: myEnrollments.filter(e => e.status === "enrolled").length.toString(), icon: UserCheck },
    { title: "Announcements", value: announcements.length.toString(), icon: FileText },
  ];

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{currentFaculty ? `, ${currentFaculty.full_name}` : ""}! Here's your overview.
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
              <CardDescription>Courses you are teaching</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myCourses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No courses assigned yet</p>
                ) : (
                  myCourses.map((course) => {
                    const courseEnrollments = myEnrollments.filter(e => e.course_id === course.id);
                    return (
                      <div key={course.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <BookOpen className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1">
                          <p className="font-medium">{course.course_name}</p>
                          <p className="text-sm text-muted-foreground">{course.course_code}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {courseEnrollments.length} students enrolled
                          </p>
                        </div>
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
              <CardDescription>Latest announcements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {announcements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No announcements yet</p>
                ) : (
                  announcements.slice(0, 5).map((announcement) => (
                    <div key={announcement.id} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{announcement.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {announcement.content}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          announcement.priority === "high" ? "bg-destructive/10 text-destructive" :
                          announcement.priority === "normal" ? "bg-primary/10 text-primary" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {announcement.priority}
                        </span>
                      </div>
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

export default FacultyDashboard;
