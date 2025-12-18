import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSkeleton } from "@/components/shared";

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  department: string | null;
  semester: number | null;
  credits: number;
  status: string | null;
  enrolled_count: number;
}

const MyCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyCourses = async () => {
      if (!user) return;

      // Get faculty record for current user
      const { data: facultyData, error: facultyError } = await supabase
        .from("faculties")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (facultyError || !facultyData) {
        console.error("Error fetching faculty:", facultyError);
        setLoading(false);
        return;
      }

      // Get courses assigned to this faculty
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("faculty_id", facultyData.id)
        .order("created_at", { ascending: false });

      if (coursesError) {
        console.error("Error fetching courses:", coursesError);
        setLoading(false);
        return;
      }

      // Get enrollment counts for each course
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("status", "enrolled");

      if (enrollmentsError) {
        console.error("Error fetching enrollments:", enrollmentsError);
      }

      // Count enrollments per course
      const countMap: Record<string, number> = {};
      enrollments?.forEach((e) => {
        countMap[e.course_id] = (countMap[e.course_id] || 0) + 1;
      });

      // Merge counts into courses
      const coursesWithCounts = coursesData?.map((course) => ({
        ...course,
        enrolled_count: countMap[course.id] || 0,
      })) || [];

      setCourses(coursesWithCounts);
      setLoading(false);
    };

    fetchFacultyCourses();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout role="faculty">
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Manage your assigned courses</p>
        </div>

        {courses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{course.course_code}</CardTitle>
                      <CardDescription className="mt-1">{course.course_name}</CardDescription>
                    </div>
                    <Badge variant={course.status === "active" ? "default" : "secondary"}>
                      {course.status || "active"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.department || "No Department"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{course.enrolled_count} Students Enrolled</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span>Semester {course.semester || "N/A"} • {course.credits} Credits</span>
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
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No courses assigned yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Contact your administrator to get courses assigned
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyCourses;
