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
import { Calendar, Save, UserCheck, UserX } from "lucide-react";
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

const Attendance = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { courses } = useCourses();
  const { markAttendance } = useAttendance();

  const [facultyCourses, setFacultyCourses] = useState<typeof courses>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
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
      }
      setLoading(false);
    };

    fetchEnrolledStudents();
    setAttendance({});
    setSubmitted(false);
  }, [selectedCourse]);

  const handleToggleAttendance = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleMarkAll = (status: boolean) => {
    const newAttendance: Record<string, boolean> = {};
    enrolledStudents.forEach(student => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
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
        status: (attendance[student.id] ? "present" : "absent") as "present" | "absent" | "late" | "excused",
        marked_by: user?.id,
      }));

      await markAttendance.mutateAsync(records);
      setSubmitted(true);
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

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = enrolledStudents.length - presentCount;
  const attendancePercentage = enrolledStudents.length > 0 
    ? ((presentCount / enrolledStudents.length) * 100).toFixed(1) 
    : 0;

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Mark Attendance</h1>
          <p className="text-muted-foreground">Record student attendance for your courses</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <UserCheck className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">{presentCount}</p>
                  <p className="text-sm text-muted-foreground">Present</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <UserX className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">{absentCount}</p>
                  <p className="text-sm text-muted-foreground">Absent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{attendancePercentage}%</p>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll(true)}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Mark All Present
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll(false)}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Mark All Absent
                  </Button>
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
                          <TableHead>Roll Number</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead className="text-center">Present</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrolledStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.student_id}</TableCell>
                            <TableCell>{student.full_name}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={attendance[student.id] || false}
                                  onCheckedChange={() => handleToggleAttendance(student.id)}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant={attendance[student.id] ? "default" : "secondary"}>
                                {attendance[student.id] ? "Present" : "Absent"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAttendance({});
                      setSubmitted(false);
                    }}
                  >
                    Clear All
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitted || loading || enrolledStudents.length === 0}>
                    <Save className="h-4 w-4 mr-2" />
                    {submitted ? "Submitted" : "Submit Attendance"}
                  </Button>
                </div>

                {submitted && (
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-sm text-success font-medium">
                      ✓ Attendance has been recorded successfully for {selectedDate}
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
