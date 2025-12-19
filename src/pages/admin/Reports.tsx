import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, FileText, Download, Calendar as CalendarIcon, TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useStudents } from "@/hooks/useStudents";
import { useCourses } from "@/hooks/useCourses";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useAttendance } from "@/hooks/useAttendance";
import { useGrades } from "@/hooks/useGrades";
import { useFaculty } from "@/hooks/useFaculty";
import { Badge } from "@/components/ui/badge";

const Reports = () => {
  const [reportType, setReportType] = useState("attendance");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const { students } = useStudents();
  const { courses } = useCourses();
  const { enrollments } = useEnrollments();
  const { attendance } = useAttendance();
  const { grades } = useGrades();
  const { faculty } = useFaculty();

  const reportTypes = [
    { value: "attendance", label: "Attendance Report", icon: BarChart3 },
    { value: "grades", label: "Grade Distribution", icon: TrendingUp },
    { value: "enrollment", label: "Enrollment Statistics", icon: FileText },
    { value: "faculty", label: "Faculty Performance", icon: BarChart3 },
  ];

  // Get unique departments from courses
  const departments = useMemo(() => {
    const depts = new Set<string>();
    courses.forEach(c => c.department && depts.add(c.department));
    faculty.forEach(f => f.department && depts.add(f.department));
    return Array.from(depts).sort();
  }, [courses, faculty]);

  // Filter and format data based on report type and filters
  const reportData = useMemo(() => {
    const filterByDate = (dateStr: string) => {
      if (!dateFrom && !dateTo) return true;
      try {
        const date = parseISO(dateStr);
        if (dateFrom && dateTo) {
          return isWithinInterval(date, { start: dateFrom, end: dateTo });
        }
        if (dateFrom) return date >= dateFrom;
        if (dateTo) return date <= dateTo;
      } catch {
        return true;
      }
      return true;
    };

    const filterByDepartment = (deptField: string | null | undefined) => {
      if (selectedDepartment === "all") return true;
      return deptField === selectedDepartment;
    };

    switch (reportType) {
      case "attendance":
        return attendance
          .filter(a => filterByDate(a.date))
          .filter(a => {
            const course = courses.find(c => c.id === a.course_id);
            return filterByDepartment(course?.department);
          })
          .map(a => ({
            student_id: students.find(s => s.id === a.student_id)?.student_id || "-",
            student_name: students.find(s => s.id === a.student_id)?.full_name || "-",
            course: courses.find(c => c.id === a.course_id)?.course_code || "-",
            date: a.date,
            status: a.status,
          }));

      case "grades":
        return grades
          .filter(g => filterByDate(g.assessment_date || ""))
          .filter(g => {
            const course = courses.find(c => c.id === g.course_id);
            return filterByDepartment(course?.department);
          })
          .map(g => ({
            student_id: students.find(s => s.id === g.student_id)?.student_id || "-",
            student_name: students.find(s => s.id === g.student_id)?.full_name || "-",
            course: courses.find(c => c.id === g.course_id)?.course_code || "-",
            assessment: g.assessment_name,
            obtained: g.obtained_marks,
            max: g.max_marks,
            percentage: g.percentage ? `${g.percentage.toFixed(1)}%` : "-",
            grade: g.grade_letter || "-",
          }));

      case "enrollment":
        return enrollments
          .filter(e => filterByDate(e.enrollment_date || ""))
          .filter(e => {
            const course = courses.find(c => c.id === e.course_id);
            return filterByDepartment(course?.department);
          })
          .map(e => ({
            student_id: students.find(s => s.id === e.student_id)?.student_id || "-",
            student_name: students.find(s => s.id === e.student_id)?.full_name || "-",
            course: courses.find(c => c.id === e.course_id)?.course_code || "-",
            course_name: courses.find(c => c.id === e.course_id)?.course_name || "-",
            date: e.enrollment_date || "-",
            status: e.status || "-",
          }));

      case "faculty":
        return faculty
          .filter(f => filterByDepartment(f.department))
          .map(f => {
            const assignedCourses = courses.filter(c => c.faculty_id === f.id);
            const totalStudents = assignedCourses.reduce((sum, course) => {
              return sum + enrollments.filter(e => e.course_id === course.id).length;
            }, 0);
            return {
              faculty_id: f.faculty_id,
              name: f.full_name,
              email: f.email,
              department: f.department || "-",
              courses_count: assignedCourses.length,
              students_count: totalStudents,
              status: f.status || "active",
            };
          });

      default:
        return [];
    }
  }, [reportType, dateFrom, dateTo, selectedDepartment, attendance, grades, enrollments, faculty, students, courses]);

  const tableHeaders = useMemo(() => {
    switch (reportType) {
      case "attendance":
        return ["Student ID", "Name", "Course", "Date", "Status"];
      case "grades":
        return ["Student ID", "Name", "Course", "Assessment", "Obtained", "Max", "Percentage", "Grade"];
      case "enrollment":
        return ["Student ID", "Name", "Course Code", "Course Name", "Date", "Status"];
      case "faculty":
        return ["Faculty ID", "Name", "Email", "Department", "Courses", "Students", "Status"];
      default:
        return [];
    }
  }, [reportType]);

  const generateCSV = (data: any[], headers: string[], filename: string) => {
    const keys = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(","),
      ...data.map(row => keys.map(k => `"${row[k] || ""}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const handleExportReport = () => {
    if (reportData.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to export.",
        variant: "destructive",
      });
      return;
    }

    generateCSV(reportData, tableHeaders, `${reportType}_report`);

    toast({
      title: "Export Successful",
      description: `Exported ${reportData.length} records as CSV.`,
    });
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = reportData.length;
    
    if (reportType === "attendance") {
      const presentCount = reportData.filter((r: any) => r.status === "present").length;
      return {
        total,
        presentRate: total > 0 ? ((presentCount / total) * 100).toFixed(1) : "0",
        avgPercentage: "0",
        activeCount: 0,
        totalCourses: 0,
      };
    }
    
    if (reportType === "grades") {
      const avgPercentage = total > 0 
        ? (reportData.reduce((sum, r: any) => sum + (parseFloat(r.percentage) || 0), 0) / total).toFixed(1)
        : "0";
      return { total, presentRate: "0", avgPercentage, activeCount: 0, totalCourses: 0 };
    }
    
    if (reportType === "enrollment") {
      const activeCount = reportData.filter((r: any) => r.status === "enrolled").length;
      return { total, presentRate: "0", avgPercentage: "0", activeCount, totalCourses: 0 };
    }
    
    if (reportType === "faculty") {
      const totalCourses = reportData.reduce((sum, r: any) => sum + (r.courses_count || 0), 0);
      return { total, presentRate: "0", avgPercentage: "0", activeCount: 0, totalCourses };
    }
    
    return { total: 0, presentRate: "0", avgPercentage: "0", activeCount: 0, totalCourses: 0 };
  }, [reportType, reportData]);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and export comprehensive reports</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.value}
                className={cn(
                  "cursor-pointer transition-colors",
                  reportType === type.value ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"
                )}
                onClick={() => setReportType(type.value)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{type.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>Configure parameters for your report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(dateFrom || dateTo || selectedDepartment !== "all") && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setDateFrom(undefined);
                  setDateTo(undefined);
                  setSelectedDepartment("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                Showing {Math.min(reportData.length, 10)} of {reportData.length} records
                {reportType === "attendance" && stats.total > 0 && (
                  <span className="ml-2">• Present rate: {stats.presentRate}%</span>
                )}
                {reportType === "grades" && stats.total > 0 && (
                  <span className="ml-2">• Avg: {stats.avgPercentage}%</span>
                )}
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
                <p className="text-muted-foreground">No data available for the selected filters</p>
              </div>
            ) : (
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {tableHeaders.map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.slice(0, 10).map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value: any, i) => (
                          <TableCell key={i}>
                            {typeof value === "string" && ["active", "inactive", "present", "absent", "late", "enrolled", "completed", "dropped"].includes(value.toLowerCase()) ? (
                              <Badge variant={
                                ["active", "present", "enrolled", "completed"].includes(value.toLowerCase()) 
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

export default Reports;
