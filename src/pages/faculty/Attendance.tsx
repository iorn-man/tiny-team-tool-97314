import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Save, UserCheck, UserX, Clock, FileQuestion, Users, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCourses } from "@/hooks/useCourses";
import { useAttendance } from "@/hooks/useAttendance";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EnrolledStudent {
  id: string;
  full_name: string;
  student_id: string;
}

type AttendanceStatus = "present" | "absent" | "late" | "excused";

const statusConfig: Record<AttendanceStatus, { label: string; variant: "default" | "destructive" | "secondary" | "outline"; icon: typeof UserCheck }> = {
  present: { label: "Present", variant: "default", icon: UserCheck },
  absent: { label: "Absent", variant: "destructive", icon: UserX },
  late: { label: "Late", variant: "secondary", icon: Clock },
  excused: { label: "Excused", variant: "outline", icon: FileQuestion },
};

const Attendance = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { courses } = useCourses();
  const { markAttendance } = useAttendance();

  const [facultyCourses, setFacultyCourses] = useState<typeof courses>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Fetch enrolled students when course is selected
  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      if (!selectedCourse) {
        setEnrolledStudents([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          student_id,
          students:student_id (
            id,
            full_name,
            student_id
          )
        `)
        .eq("course_id", selectedCourse)
        .eq("status", "enrolled");

      if (!error && data) {
        const students = data
          .filter(e => e.students)
          .map(e => ({
            id: (e.students as any).id,
            full_name: (e.students as any).full_name,
            student_id: (e.students as any).student_id,
          }));
        setEnrolledStudents(students);
        // Default all to absent
        const defaultAttendance: Record<string, AttendanceStatus> = {};
        students.forEach(s => defaultAttendance[s.id] = "absent");
        setAttendance(defaultAttendance);
      }
      setLoading(false);
    };

    fetchEnrolledStudents();
    setSelectedStudents([]);
    setSubmitted(false);
  }, [selectedCourse]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleToggleSelect = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === enrolledStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(enrolledStudents.map(s => s.id));
    }
  };

  const handleBulkStatusChange = (status: AttendanceStatus) => {
    const targetStudents = selectedStudents.length > 0 ? selectedStudents : enrolledStudents.map(s => s.id);
    const newAttendance = { ...attendance };
    targetStudents.forEach(id => {
      newAttendance[id] = status;
    });
    setAttendance(newAttendance);
    toast({
      title: "Status Updated",
      description: `Marked ${targetStudents.length} students as ${status}`,
    });
  };

  const handleSubmit = async () => {
    if (!selectedCourse) {
      toast({
        title: "Course Required",
        description: "Please select a course before submitting attendance",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const records = enrolledStudents.map(student => ({
        student_id: student.id,
        course_id: selectedCourse,
        date: selectedDate,
        status: attendance[student.id] || "absent",
        marked_by: user?.id,
      }));

      await markAttendance.mutateAsync(records);
      setSubmitted(true);
      setSelectedStudents([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit attendance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const presentCount = Object.values(attendance).filter(s => s === "present").length;
  const absentCount = Object.values(attendance).filter(s => s === "absent").length;
  const lateCount = Object.values(attendance).filter(s => s === "late").length;
  const excusedCount = Object.values(attendance).filter(s => s === "excused").length;
  const attendancePercentage = enrolledStudents.length > 0 
    ? (((presentCount + lateCount) / enrolledStudents.length) * 100).toFixed(1) 
    : 0;

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Mark Attendance</h1>
          <p className="text-muted-foreground">Record student attendance for your courses</p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10">
                  <UserCheck className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-green-500">{presentCount}</p>
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
                  <p className="text-xl font-bold text-destructive">{absentCount}</p>
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
                  <p className="text-xl font-bold text-yellow-500">{lateCount}</p>
                  <p className="text-xs text-muted-foreground">Late</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <FileQuestion className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-blue-500">{excusedCount}</p>
                  <p className="text-xs text-muted-foreground">Excused</p>
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
                  <p className="text-xl font-bold text-primary">{attendancePercentage}%</p>
                  <p className="text-xs text-muted-foreground">Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Details</CardTitle>
            <CardDescription>Select course and date to mark attendance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course">Select Course *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSubmitted(false);
                  }}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {selectedCourse && (
              <>
                {/* Bulk Actions */}
                <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mr-4">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {selectedStudents.length > 0 
                        ? `${selectedStudents.length} selected` 
                        : "Bulk Actions (all students)"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkStatusChange("present")}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkStatusChange("absent")}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Absent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkStatusChange("late")}
                      className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Late
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkStatusChange("excused")}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <FileQuestion className="h-4 w-4 mr-1" />
                      Excused
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading students...</div>
                ) : enrolledStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No students enrolled in this course
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedStudents.length === enrolledStudents.length && enrolledStudents.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Roll Number</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Quick Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrolledStudents.map((student) => {
                          const status = attendance[student.id] || "absent";
                          const config = statusConfig[status];
                          return (
                            <TableRow 
                              key={student.id}
                              className={selectedStudents.includes(student.id) ? "bg-primary/5" : ""}
                            >
                              <TableCell>
                                <Checkbox
                                  checked={selectedStudents.includes(student.id)}
                                  onCheckedChange={() => handleToggleSelect(student.id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{student.student_id}</TableCell>
                              <TableCell>{student.full_name}</TableCell>
                              <TableCell>
                                <Select
                                  value={status}
                                  onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                                >
                                  <SelectTrigger className="w-32 bg-background">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-background z-50">
                                    {Object.entries(statusConfig).map(([key, cfg]) => (
                                      <SelectItem key={key} value={key}>
                                        {cfg.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant={status === "present" ? "default" : "ghost"}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleStatusChange(student.id, "present")}
                                    title="Present"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant={status === "absent" ? "destructive" : "ghost"}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleStatusChange(student.id, "absent")}
                                    title="Absent"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant={status === "late" ? "secondary" : "ghost"}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleStatusChange(student.id, "late")}
                                    title="Late"
                                  >
                                    <Clock className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  {selectedStudents.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedStudents([])}
                    >
                      Clear Selection
                    </Button>
                  )}
                  <div className="flex-1" />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const defaultAttendance: Record<string, AttendanceStatus> = {};
                        enrolledStudents.forEach(s => defaultAttendance[s.id] = "absent");
                        setAttendance(defaultAttendance);
                        setSelectedStudents([]);
                        setSubmitted(false);
                      }}
                    >
                      Reset All
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitted || loading || enrolledStudents.length === 0}>
                      <Save className="h-4 w-4 mr-2" />
                      {submitted ? "Submitted" : "Submit Attendance"}
                    </Button>
                  </div>
                </div>

                {submitted && (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <p className="text-sm text-green-600 font-medium">
                      Attendance has been recorded successfully for {selectedDate}
                    </p>
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

export default Attendance;
