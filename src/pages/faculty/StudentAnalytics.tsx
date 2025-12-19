import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, Users, Award, Calendar, BarChart3 } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays, eachDayOfInterval, parseISO } from "date-fns";

interface StudentPerformance {
  id: string;
  full_name: string;
  student_id: string;
  attendanceRate: number;
  averageGrade: number;
  totalAssessments: number;
}

interface AttendanceTrend {
  date: string;
  presentRate: number;
  absentRate: number;
  totalStudents: number;
}

interface GradeDistribution {
  grade: string;
  count: number;
  color: string;
}

const COLORS = ["hsl(var(--success))", "hsl(var(--primary))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--muted))"];
const GRADE_COLORS: Record<string, string> = {
  "A+": "hsl(142, 76%, 36%)",
  "A": "hsl(142, 70%, 45%)",
  "A-": "hsl(142, 64%, 54%)",
  "B+": "hsl(221, 83%, 53%)",
  "B": "hsl(221, 75%, 60%)",
  "B-": "hsl(221, 68%, 67%)",
  "C+": "hsl(45, 93%, 47%)",
  "C": "hsl(45, 85%, 55%)",
  "C-": "hsl(45, 77%, 63%)",
  "F": "hsl(0, 84%, 60%)",
};

const StudentAnalytics = () => {
  const { user } = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses();

  const [facultyCourses, setFacultyCourses] = useState<typeof courses>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [attendanceTrends, setAttendanceTrends] = useState<AttendanceTrend[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution[]>([]);
  const [gradeProgression, setGradeProgression] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [overallStats, setOverallStats] = useState({
    avgAttendance: 0,
    avgGrade: 0,
    totalStudents: 0,
    topPerformer: "",
  });

  // Fetch faculty's courses
  useEffect(() => {
    const fetchFacultyCourses = async () => {
      if (!user) return;

      const { data: facultyData } = await supabase
        .from("faculties")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (facultyData) {
        const filtered = courses.filter(c => c.faculty_id === facultyData.id);
        setFacultyCourses(filtered);
      }
    };

    if (courses.length > 0) {
      fetchFacultyCourses();
    }
  }, [user, courses]);

  // Fetch analytics data when course is selected
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedCourse) {
        setStudents([]);
        setAttendanceTrends([]);
        setGradeDistribution([]);
        setGradeProgression([]);
        return;
      }

      setLoading(true);

      try {
        // Fetch enrolled students
        const { data: enrollments } = await supabase
          .from("enrollments")
          .select(`
            student_id,
            students:student_id (id, full_name, student_id)
          `)
          .eq("course_id", selectedCourse)
          .eq("status", "enrolled");

        const enrolledStudents = enrollments?.filter(e => e.students).map(e => ({
          id: (e.students as any).id,
          full_name: (e.students as any).full_name,
          student_id: (e.students as any).student_id,
        })) || [];

        // Fetch attendance for last 30 days
        const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
        const { data: attendanceData } = await supabase
          .from("attendance")
          .select("*")
          .eq("course_id", selectedCourse)
          .gte("date", thirtyDaysAgo);

        // Fetch grades
        const { data: gradesData } = await supabase
          .from("grades")
          .select("*")
          .eq("course_id", selectedCourse);

        // Calculate student performance
        const studentPerformance: StudentPerformance[] = enrolledStudents.map(student => {
          const studentAttendance = attendanceData?.filter(a => a.student_id === student.id) || [];
          const presentCount = studentAttendance.filter(a => a.status === "present" || a.status === "late").length;
          const attendanceRate = studentAttendance.length > 0 
            ? (presentCount / studentAttendance.length) * 100 
            : 0;

          const studentGrades = gradesData?.filter(g => g.student_id === student.id) || [];
          const avgGrade = studentGrades.length > 0
            ? studentGrades.reduce((acc, g) => acc + (g.percentage || 0), 0) / studentGrades.length
            : 0;

          return {
            id: student.id,
            full_name: student.full_name,
            student_id: student.student_id,
            attendanceRate: Math.round(attendanceRate * 10) / 10,
            averageGrade: Math.round(avgGrade * 10) / 10,
            totalAssessments: studentGrades.length,
          };
        });

        setStudents(studentPerformance);

        // Calculate attendance trends (last 14 days)
        const days = eachDayOfInterval({
          start: subDays(new Date(), 13),
          end: new Date(),
        });

        const trends: AttendanceTrend[] = days.map(day => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayAttendance = attendanceData?.filter(a => a.date === dateStr) || [];
          const presentCount = dayAttendance.filter(a => a.status === "present" || a.status === "late").length;
          const absentCount = dayAttendance.filter(a => a.status === "absent").length;
          const total = dayAttendance.length;

          return {
            date: format(day, "MMM dd"),
            presentRate: total > 0 ? Math.round((presentCount / total) * 100) : 0,
            absentRate: total > 0 ? Math.round((absentCount / total) * 100) : 0,
            totalStudents: total,
          };
        });

        setAttendanceTrends(trends);

        // Calculate grade distribution
        const gradeLetterCount: Record<string, number> = {};
        gradesData?.forEach(grade => {
          const letter = getGradeLetter(grade.percentage || 0);
          gradeLetterCount[letter] = (gradeLetterCount[letter] || 0) + 1;
        });

        const distribution: GradeDistribution[] = Object.entries(gradeLetterCount)
          .map(([grade, count]) => ({
            grade,
            count,
            color: GRADE_COLORS[grade] || "hsl(var(--muted))",
          }))
          .sort((a, b) => {
            const order = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "F"];
            return order.indexOf(a.grade) - order.indexOf(b.grade);
          });

        setGradeDistribution(distribution);

        // Calculate grade progression by assessment type
        const assessmentTypes = [...new Set(gradesData?.map(g => g.assessment_name) || [])];
        const progression = assessmentTypes.map(assessmentName => {
          const assessmentGrades = gradesData?.filter(g => g.assessment_name === assessmentName) || [];
          const avgPercentage = assessmentGrades.length > 0
            ? assessmentGrades.reduce((acc, g) => acc + (g.percentage || 0), 0) / assessmentGrades.length
            : 0;
          
          return {
            assessment: assessmentName,
            average: Math.round(avgPercentage * 10) / 10,
            count: assessmentGrades.length,
          };
        });

        setGradeProgression(progression);

        // Calculate overall stats
        const avgAttendance = studentPerformance.length > 0
          ? studentPerformance.reduce((acc, s) => acc + s.attendanceRate, 0) / studentPerformance.length
          : 0;
        
        const avgGrade = studentPerformance.length > 0
          ? studentPerformance.reduce((acc, s) => acc + s.averageGrade, 0) / studentPerformance.length
          : 0;

        const topPerformer = studentPerformance.length > 0
          ? studentPerformance.reduce((prev, curr) => 
              (curr.averageGrade > prev.averageGrade) ? curr : prev
            ).full_name
          : "";

        setOverallStats({
          avgAttendance: Math.round(avgAttendance * 10) / 10,
          avgGrade: Math.round(avgGrade * 10) / 10,
          totalStudents: enrolledStudents.length,
          topPerformer,
        });

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedCourse]);

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 85) return "A";
    if (percentage >= 80) return "A-";
    if (percentage >= 75) return "B+";
    if (percentage >= 70) return "B";
    if (percentage >= 65) return "B-";
    if (percentage >= 60) return "C+";
    if (percentage >= 55) return "C";
    if (percentage >= 50) return "C-";
    return "F";
  };

  // Get individual student data
  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Student Performance Analytics</h1>
          <p className="text-muted-foreground">View attendance trends and grade progression</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
            <CardDescription>Choose a course to view analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger id="course" className="bg-background">
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {facultyCourses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.course_name} ({course.course_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCourse && students.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="student">Filter by Student (Optional)</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger id="student" className="bg-background">
                      <SelectValue placeholder="All students" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="all">All Students</SelectItem>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} ({student.student_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>
        )}

        {selectedCourse && !loading && (
          <>
            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{overallStats.totalStudents}</p>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-success/10">
                      <Calendar className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-success">{overallStats.avgAttendance}%</p>
                      <p className="text-sm text-muted-foreground">Avg Attendance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-warning/10">
                      <BarChart3 className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-warning">{overallStats.avgGrade}%</p>
                      <p className="text-sm text-muted-foreground">Avg Grade</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-bold truncate max-w-[120px]" title={overallStats.topPerformer}>
                        {overallStats.topPerformer || "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">Top Performer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Attendance Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Attendance Trend (Last 14 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={attendanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="presentRate" 
                          name="Present %" 
                          stroke="hsl(var(--success))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--success))' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="absentRate" 
                          name="Absent %" 
                          stroke="hsl(var(--destructive))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--destructive))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Grade Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Grade Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {gradeDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={gradeDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ grade, percent }) => `${grade} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {gradeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No grade data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Grade Progression Bar Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Average Grade by Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {gradeProgression.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gradeProgression}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="assessment" 
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            domain={[0, 100]}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => [`${value}%`, 'Avg Score']}
                          />
                          <Bar 
                            dataKey="average" 
                            fill="hsl(var(--primary))" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No assessment data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Student Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Student Performance Overview</CardTitle>
                <CardDescription>Individual student attendance and grade summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Roll No</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Student Name</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Attendance Rate</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Avg Grade</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Assessments</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter(s => !selectedStudent || selectedStudent === "all" || s.id === selectedStudent)
                        .map((student, idx) => (
                        <tr key={student.id} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="px-4 py-3 text-sm font-medium">{student.student_id}</td>
                          <td className="px-4 py-3 text-sm">{student.full_name}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 ${
                              student.attendanceRate >= 75 ? 'text-success' :
                              student.attendanceRate >= 60 ? 'text-warning' : 'text-destructive'
                            }`}>
                              {student.attendanceRate >= 75 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {student.attendanceRate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-medium ${
                              student.averageGrade >= 75 ? 'text-success' :
                              student.averageGrade >= 60 ? 'text-primary' :
                              student.averageGrade >= 50 ? 'text-warning' : 'text-destructive'
                            }`}>
                              {student.averageGrade > 0 ? `${student.averageGrade}%` : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm">{student.totalAssessments}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              student.attendanceRate >= 75 && student.averageGrade >= 60 
                                ? 'bg-success/10 text-success' 
                                : student.attendanceRate < 60 || student.averageGrade < 50
                                  ? 'bg-destructive/10 text-destructive'
                                  : 'bg-warning/10 text-warning'
                            }`}>
                              {student.attendanceRate >= 75 && student.averageGrade >= 60 ? 'Good' :
                               student.attendanceRate < 60 || student.averageGrade < 50 ? 'At Risk' : 'Needs Attention'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAnalytics;
