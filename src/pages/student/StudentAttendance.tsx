import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSkeleton } from "@/components/shared";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  notes?: string;
  course: {
    id: string;
    course_code: string;
    course_name: string;
  };
}

interface CourseAttendanceSummary {
  courseId: string;
  courseCode: string;
  courseName: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

const StudentAttendance = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentAndAttendance = async () => {
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

        // Get attendance with course info
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendance")
          .select(`
            id,
            date,
            status,
            notes,
            courses:course_id (
              id,
              course_code,
              course_name
            )
          `)
          .eq("student_id", studentData.id)
          .order("date", { ascending: false });

        if (attendanceError) throw attendanceError;

        const formattedAttendance = (attendanceData || []).map((a: any) => ({
          ...a,
          course: a.courses,
        }));

        setAttendance(formattedAttendance);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentAndAttendance();
  }, [user]);

  // Calculate course-wise summaries
  const courseSummaries: CourseAttendanceSummary[] = attendance.reduce((acc: CourseAttendanceSummary[], record) => {
    const existingCourse = acc.find(c => c.courseId === record.course?.id);
    
    if (existingCourse) {
      existingCourse.total++;
      if (record.status === "present") existingCourse.present++;
      else if (record.status === "absent") existingCourse.absent++;
      else if (record.status === "late") existingCourse.late++;
      else if (record.status === "excused") existingCourse.excused++;
      
      existingCourse.percentage = ((existingCourse.present + existingCourse.late) / existingCourse.total) * 100;
    } else if (record.course) {
      const isPresent = record.status === "present" || record.status === "late";
      acc.push({
        courseId: record.course.id,
        courseCode: record.course.course_code,
        courseName: record.course.course_name,
        total: 1,
        present: record.status === "present" ? 1 : 0,
        absent: record.status === "absent" ? 1 : 0,
        late: record.status === "late" ? 1 : 0,
        excused: record.status === "excused" ? 1 : 0,
        percentage: isPresent ? 100 : 0,
      });
    }
    
    return acc;
  }, []);

  // Calculate overall attendance
  const overallAttendance = courseSummaries.length > 0
    ? courseSummaries.reduce((sum, c) => sum + c.percentage, 0) / courseSummaries.length
    : 0;

  // Filter attendance records
  const filteredRecords = selectedCourse === "all"
    ? attendance
    : attendance.filter(a => a.course?.id === selectedCourse);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      present: "default",
      absent: "destructive",
      late: "secondary",
      excused: "outline",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
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
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Track your attendance across all courses</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overall Attendance</CardTitle>
            <CardDescription>Your total attendance percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-3xl font-bold ${getPercentageColor(overallAttendance)}`}>
                    {overallAttendance.toFixed(1)}%
                  </span>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <Progress value={overallAttendance} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {courseSummaries.length} enrolled courses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {courseSummaries.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No attendance records yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Course-wise Attendance</CardTitle>
                <CardDescription>Attendance breakdown by course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {courseSummaries.map((summary) => (
                    <div key={summary.courseId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {summary.courseCode} - {summary.courseName}
                          </span>
                          {summary.percentage >= 85 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : summary.percentage < 75 ? (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          ) : null}
                        </div>
                        <span className={`font-bold ${getPercentageColor(summary.percentage)}`}>
                          {summary.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={summary.percentage} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Present: {summary.present} | Late: {summary.late} | Absent: {summary.absent} | Excused: {summary.excused}
                        </span>
                        <span>Total: {summary.total} classes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>Recent attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Filter by course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courseSummaries.map((course) => (
                        <SelectItem key={course.courseId} value={course.courseId}>
                          {course.courseCode} - {course.courseName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filteredRecords.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No attendance records found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.slice(0, 50).map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{format(new Date(record.date), "PP")}</TableCell>
                          <TableCell>{record.course?.course_code}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendance;
