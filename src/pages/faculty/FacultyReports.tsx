import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Download, FileText, TrendingUp, Users } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const FacultyReports = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [reportType, setReportType] = useState("attendance");

  // Fetch faculty's courses
  const { data: facultyData } = useQuery({
    queryKey: ["faculty-data", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faculties")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["faculty-courses", facultyData?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("faculty_id", facultyData?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!facultyData?.id,
  });

  const courseIds = courses.map(c => c.id);

  // Fetch enrollments for these courses
  const { data: enrollments = [] } = useQuery({
    queryKey: ["faculty-enrollments", courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      const { data, error } = await supabase
        .from("enrollments")
        .select("*, students(id, full_name, student_id)")
        .in("course_id", courseIds);
      if (error) throw error;
      return data;
    },
    enabled: courseIds.length > 0,
  });

  // Fetch attendance
  const { data: attendance = [] } = useQuery({
    queryKey: ["faculty-attendance", courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .in("course_id", courseIds);
      if (error) throw error;
      return data;
    },
    enabled: courseIds.length > 0,
  });

  // Fetch grades
  const { data: grades = [] } = useQuery({
    queryKey: ["faculty-grades", courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      const { data, error } = await supabase
        .from("grades")
        .select("*")
        .in("course_id", courseIds);
      if (error) throw error;
      return data;
    },
    enabled: courseIds.length > 0,
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const filteredCourseIds = selectedCourse === "all" ? courseIds : [selectedCourse];
    
    const filteredAttendance = attendance.filter(a => filteredCourseIds.includes(a.course_id));
    const presentCount = filteredAttendance.filter(a => a.status === "present").length;
    const attendanceRate = filteredAttendance.length > 0 
      ? ((presentCount / filteredAttendance.length) * 100).toFixed(1) 
      : "0";

    const filteredGrades = grades.filter(g => filteredCourseIds.includes(g.course_id));
    const avgGrade = filteredGrades.length > 0
      ? (filteredGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / filteredGrades.length).toFixed(1)
      : "0";

    const filteredEnrollments = enrollments.filter(e => filteredCourseIds.includes(e.course_id));
    const uniqueStudents = new Set(filteredEnrollments.map(e => e.student_id)).size;

    return {
      attendanceRate,
      avgGrade,
      totalStudents: uniqueStudents,
      totalRecords: reportType === "attendance" ? filteredAttendance.length : filteredGrades.length,
    };
  }, [selectedCourse, courseIds, attendance, grades, enrollments, reportType]);

  // Generate report data
  const reportData = useMemo(() => {
    const filteredCourseIds = selectedCourse === "all" ? courseIds : [selectedCourse];

    if (reportType === "attendance") {
      return attendance
        .filter(a => filteredCourseIds.includes(a.course_id))
        .map(a => {
          const enrollment = enrollments.find(e => e.student_id === a.student_id);
          const course = courses.find(c => c.id === a.course_id);
          return {
            student_id: enrollment?.students?.student_id || "-",
            student_name: enrollment?.students?.full_name || "-",
            course: course?.course_code || "-",
            date: a.date,
            status: a.status,
          };
        });
    } else {
      return grades
        .filter(g => filteredCourseIds.includes(g.course_id))
        .map(g => {
          const enrollment = enrollments.find(e => e.student_id === g.student_id);
          const course = courses.find(c => c.id === g.course_id);
          return {
            student_id: enrollment?.students?.student_id || "-",
            student_name: enrollment?.students?.full_name || "-",
            course: course?.course_code || "-",
            assessment: g.assessment_name,
            obtained: g.obtained_marks,
            max: g.max_marks,
            percentage: g.percentage ? `${g.percentage.toFixed(1)}%` : "-",
            grade: g.grade_letter || "-",
          };
        });
    }
  }, [reportType, selectedCourse, courseIds, attendance, grades, enrollments, courses]);

  const handleExportReport = () => {
    if (reportData.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = reportType === "attendance" 
      ? ["Student ID", "Name", "Course", "Date", "Status"]
      : ["Student ID", "Name", "Course", "Assessment", "Obtained", "Max", "Percentage", "Grade"];

    const keys = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(","),
      ...reportData.map(row => keys.map(k => `"${(row as any)[k] || ""}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${reportType}_report_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    toast({
      title: "Export Successful",
      description: `Exported ${reportData.length} records.`,
    });
  };

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate student performance reports</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>Select course and report type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Course</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.course_code} - {course.course_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">Attendance Report</SelectItem>
                    <SelectItem value="grades">Grade Distribution</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
              <p className="text-xs text-muted-foreground">
                {selectedCourse === "all" ? "Across all courses" : "Selected course"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgGrade}%</div>
              <p className="text-xs text-muted-foreground">
                {selectedCourse === "all" ? "Across all courses" : "Selected course"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                {selectedCourse === "all" ? "Across all courses" : "Selected course"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                Showing {Math.min(reportData.length, 10)} of {reportData.length} records
              </CardDescription>
            </div>
            <Button onClick={handleExportReport} disabled={reportData.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            {reportData.length === 0 ? (
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {courses.length === 0 
                    ? "No courses assigned to you yet" 
                    : "No data available for the selected course"}
                </p>
              </div>
            ) : (
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {reportType === "attendance" ? (
                        <>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Assessment</TableHead>
                          <TableHead>Obtained</TableHead>
                          <TableHead>Max</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Grade</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.slice(0, 10).map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value: any, i) => (
                          <TableCell key={i}>
                            {typeof value === "string" && ["present", "absent", "late"].includes(value.toLowerCase()) ? (
                              <Badge variant={
                                value.toLowerCase() === "present" 
                                  ? "default" 
                                  : value.toLowerCase() === "late" 
                                    ? "secondary" 
                                    : "destructive"
                              }>
                                {value}
                              </Badge>
                            ) : (
                              value
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FacultyReports;
