import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSkeleton } from "@/components/shared";
import { format } from "date-fns";

interface Grade {
  id: string;
  assessment_name: string;
  assessment_type: string;
  obtained_marks: number;
  max_marks: number;
  percentage: number;
  grade_letter?: string;
  assessment_date?: string;
  course: {
    id: string;
    course_code: string;
    course_name: string;
  };
}

interface CourseGradeSummary {
  courseId: string;
  courseCode: string;
  courseName: string;
  grades: Grade[];
  averagePercentage: number;
  gradeCount: number;
}

const StudentGrades = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentAndGrades = async () => {
      if (!user) return;

      try {
        // Get student record
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (studentError) throw studentError;
        if (!studentData) {
          setIsLoading(false);
          return;
        }

        setStudentId(studentData.id);

        // Get grades with course info
        const { data: gradesData, error: gradesError } = await supabase
          .from("grades")
          .select(`
            id,
            assessment_name,
            assessment_type,
            obtained_marks,
            max_marks,
            percentage,
            grade_letter,
            assessment_date,
            courses:course_id (
              id,
              course_code,
              course_name
            )
          `)
          .eq("student_id", studentData.id)
          .order("assessment_date", { ascending: false });

        if (gradesError) throw gradesError;

        const formattedGrades = (gradesData || []).map((g: any) => ({
          ...g,
          course: g.courses,
        }));

        setGrades(formattedGrades);
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentAndGrades();
  }, [user]);

  // Group grades by course
  const courseGradeSummaries: CourseGradeSummary[] = grades.reduce((acc: CourseGradeSummary[], grade) => {
    const existingCourse = acc.find(c => c.courseId === grade.course?.id);
    
    if (existingCourse) {
      existingCourse.grades.push(grade);
      existingCourse.averagePercentage = 
        existingCourse.grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / existingCourse.grades.length;
      existingCourse.gradeCount++;
    } else if (grade.course) {
      acc.push({
        courseId: grade.course.id,
        courseCode: grade.course.course_code,
        courseName: grade.course.course_name,
        grades: [grade],
        averagePercentage: grade.percentage || 0,
        gradeCount: 1,
      });
    }
    
    return acc;
  }, []);

  const filteredCourses = selectedCourse === "all" 
    ? courseGradeSummaries 
    : courseGradeSummaries.filter(c => c.courseId === selectedCourse);

  const getGradeLetter = (percentage: number): string => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "A-";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    return "F";
  };

  const getGradeBadge = (grade: string) => {
    const gradeColors: Record<string, "default" | "secondary" | "destructive"> = {
      "A": "default",
      "A-": "default",
      "B+": "secondary",
      "B": "secondary",
      "C": "secondary",
      "F": "destructive",
    };
    return <Badge variant={gradeColors[grade] || "secondary"}>{grade}</Badge>;
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <DashboardLayout role="student">
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  if (!studentId) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Student Record Found</h2>
            <p className="text-muted-foreground">Please contact admin to link your account.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Grades</h1>
          <p className="text-muted-foreground">View your grades and academic performance</p>
        </div>

        {courseGradeSummaries.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No grades recorded yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {courseGradeSummaries.map((course) => (
                <Card key={course.courseId}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{course.courseCode}</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold">
                        {getGradeLetter(course.averagePercentage)}
                      </div>
                      <span className={`text-sm font-medium ${getPercentageColor(course.averagePercentage)}`}>
                        {course.averagePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={course.averagePercentage} className="mt-2 h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {course.gradeCount} assessments
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Grades</CardTitle>
                <CardDescription>Assessment-wise breakdown of your grades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courseGradeSummaries.map((course) => (
                        <SelectItem key={course.courseId} value={course.courseId}>
                          {course.courseCode} - {course.courseName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-6">
                  {filteredCourses.map((course) => (
                    <div key={course.courseId} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{course.courseCode} - {course.courseName}</h3>
                        <div className="flex items-center gap-2">
                          {getGradeBadge(getGradeLetter(course.averagePercentage))}
                          <span className={`font-bold ${getPercentageColor(course.averagePercentage)}`}>
                            {course.averagePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Assessment</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Percentage</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {course.grades.map((grade) => (
                            <TableRow key={grade.id}>
                              <TableCell>{grade.assessment_name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{grade.assessment_type}</Badge>
                              </TableCell>
                              <TableCell>
                                {grade.obtained_marks}/{grade.max_marks}
                              </TableCell>
                              <TableCell>
                                {grade.assessment_date 
                                  ? format(new Date(grade.assessment_date), "PP")
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className={getPercentageColor(grade.percentage || 0)}>
                                    {(grade.percentage || 0).toFixed(1)}%
                                  </span>
                                  {(grade.percentage || 0) >= 85 && (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentGrades;
