import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Filter, UserCheck, UserX, Clock, FileQuestion, ChevronLeft, ChevronRight, History } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/hooks/useCourses";
import { format, subDays, startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

const statusConfig: Record<AttendanceStatus, { label: string; variant: "default" | "destructive" | "secondary" | "outline"; color: string }> = {
  present: { label: "Present", variant: "default", color: "text-green-500" },
  absent: { label: "Absent", variant: "destructive", color: "text-destructive" },
  late: { label: "Late", variant: "secondary", color: "text-yellow-500" },
  excused: { label: "Excused", variant: "outline", color: "text-blue-500" },
};

const AttendanceHistory = () => {
  const { user } = useAuth();
  const { courses } = useCourses();

  const [facultyCourses, setFacultyCourses] = useState<typeof courses>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 20;

  // Fetch faculty's courses
  useEffect(() => {
    const fetchFacultyCourses = async () => {
      if (!user) return;

      const { data: facultyData } = await supabase
        .from("faculties")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (facultyData) {
        const filtered = courses.filter(c => c.faculty_id === facultyData.id);
        setFacultyCourses(filtered);
      }
    };

    if (courses.length > 0) {
      fetchFacultyCourses();
    }
  }, [user, courses]);

  const courseIds = facultyCourses.map(c => c.id);

  // Fetch attendance history
  const { data: attendanceRecords = [], isLoading } = useQuery({
    queryKey: ["attendance-history", courseIds, dateFrom, dateTo],
    queryFn: async () => {
      if (courseIds.length === 0) return [];

      let query = supabase
        .from("attendance")
        .select(`
          *,
          students:student_id (id, full_name, student_id),
          courses:course_id (id, course_code, course_name)
        `)
        .in("course_id", courseIds)
        .order("date", { ascending: false });

      if (dateFrom) {
        query = query.gte("date", format(dateFrom, "yyyy-MM-dd"));
      }
      if (dateTo) {
        query = query.lte("date", format(dateTo, "yyyy-MM-dd"));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: courseIds.length > 0,
  });

  // Get unique students from attendance records
  const uniqueStudents = useMemo(() => {
    const studentMap = new Map();
    attendanceRecords.forEach((record: any) => {
      if (record.students && !studentMap.has(record.students.id)) {
        studentMap.set(record.students.id, record.students);
      }
    });
    return Array.from(studentMap.values());
  }, [attendanceRecords]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((record: any) => {
      const matchesCourse = selectedCourse === "all" || record.course_id === selectedCourse;
      const matchesStudent = selectedStudent === "all" || record.student_id === selectedStudent;
      const matchesStatus = selectedStatus === "all" || record.status === selectedStatus;
      return matchesCourse && matchesStudent && matchesStatus;
    });
  }, [attendanceRecords, selectedCourse, selectedStudent, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRecords, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourse, selectedStudent, selectedStatus, dateFrom, dateTo]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter((r: any) => r.status === "present").length;
    const absent = filteredRecords.filter((r: any) => r.status === "absent").length;
    const late = filteredRecords.filter((r: any) => r.status === "late").length;
    const excused = filteredRecords.filter((r: any) => r.status === "excused").length;
    const attendanceRate = total > 0 ? (((present + late) / total) * 100).toFixed(1) : "0";
    
    return { total, present, absent, late, excused, attendanceRate };
  }, [filteredRecords]);

  // Export to CSV
  const handleExport = () => {
    const headers = ["Date", "Student ID", "Student Name", "Course", "Status"];
    const rows = filteredRecords.map((record: any) => [
      record.date,
      record.students?.student_id || "-",
      record.students?.full_name || "-",
      record.courses?.course_code || "-",
      record.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_history_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  // Quick date filters
  const setQuickDateFilter = (days: number | "thisMonth" | "lastMonth") => {
    const today = new Date();
    if (days === "thisMonth") {
      setDateFrom(startOfMonth(today));
      setDateTo(endOfMonth(today));
    } else if (days === "lastMonth") {
      const lastMonth = subDays(startOfMonth(today), 1);
      setDateFrom(startOfMonth(lastMonth));
      setDateTo(endOfMonth(lastMonth));
    } else {
      setDateFrom(subDays(today, days));
      setDateTo(today);
    }
  };

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <History className="h-8 w-8" />
              Attendance History
            </h1>
            <p className="text-muted-foreground">View past attendance records for your courses</p>
          </div>
          <Button onClick={handleExport} disabled={filteredRecords.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-muted">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10">
                  <UserCheck className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-green-500">{stats.present}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-destructive/10">
                  <UserX className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xl font-bold text-destructive">{stats.absent}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-yellow-500">{stats.late}</p>
                  <p className="text-xs text-muted-foreground">Late</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">{stats.attendanceRate}%</p>
                  <p className="text-xs text-muted-foreground">Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide" : "Show"}
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent className="space-y-4">
              {/* Quick Date Filters */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setQuickDateFilter(7)}>Last 7 days</Button>
                <Button variant="outline" size="sm" onClick={() => setQuickDateFilter(30)}>Last 30 days</Button>
                <Button variant="outline" size="sm" onClick={() => setQuickDateFilter("thisMonth")}>This month</Button>
                <Button variant="outline" size="sm" onClick={() => setQuickDateFilter("lastMonth")}>Last month</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {/* Date From */}
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date To */}
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Course Filter */}
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="all">All Courses</SelectItem>
                      {facultyCourses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.course_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Student Filter */}
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="all">All Students</SelectItem>
                      {uniqueStudents.map((student: any) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.entries(statusConfig).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedCourse("all");
                  setSelectedStudent("all");
                  setSelectedStatus("all");
                  setDateFrom(subDays(new Date(), 30));
                  setDateTo(new Date());
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              Showing {paginatedRecords.length} of {filteredRecords.length} records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No attendance records found</p>
                <p className="text-sm">Try adjusting your filters or date range</p>
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRecords.map((record: any) => {
                        const config = statusConfig[record.status as AttendanceStatus] || statusConfig.absent;
                        return (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {format(parseISO(record.date), "PP")}
                            </TableCell>
                            <TableCell>{record.students?.student_id || "-"}</TableCell>
                            <TableCell>{record.students?.full_name || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {record.courses?.course_code || "-"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={config.variant}>
                                {config.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceHistory;
