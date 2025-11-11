import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

const StudentAttendance = () => {
  const [selectedCourse, setSelectedCourse] = useState("all");

  // Mock attendance data
  const attendanceSummary = [
    {
      course: "CS101 - Introduction to Programming",
      total: 30,
      present: 28,
      absent: 2,
      percentage: 93.3,
      trend: "up",
    },
    {
      course: "CS201 - Data Structures",
      total: 28,
      present: 24,
      absent: 4,
      percentage: 85.7,
      trend: "down",
    },
    {
      course: "MATH201 - Calculus II",
      total: 32,
      present: 31,
      absent: 1,
      percentage: 96.9,
      trend: "up",
    },
  ];

  const attendanceRecords = [
    { date: "2025-01-10", course: "CS101", status: "present" },
    { date: "2025-01-10", course: "CS201", status: "present" },
    { date: "2025-01-09", course: "MATH201", status: "present" },
    { date: "2025-01-09", course: "CS101", status: "absent" },
    { date: "2025-01-08", course: "CS201", status: "present" },
  ];

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "present" ? "default" : "destructive"}>
        {status}
      </Badge>
    );
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const overallAttendance = 91.9;

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
                    {overallAttendance}%
                  </span>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <Progress value={overallAttendance} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Based on all enrolled courses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course-wise Attendance</CardTitle>
            <CardDescription>Attendance breakdown by course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {attendanceSummary.map((summary, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{summary.course}</span>
                      {summary.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <span className={`font-bold ${getPercentageColor(summary.percentage)}`}>
                      {summary.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={summary.percentage} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Present: {summary.present} | Absent: {summary.absent}</span>
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
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="cs101">CS101 - Introduction to Programming</SelectItem>
                  <SelectItem value="cs201">CS201 - Data Structures</SelectItem>
                  <SelectItem value="math201">MATH201 - Calculus II</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.course}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendance;
