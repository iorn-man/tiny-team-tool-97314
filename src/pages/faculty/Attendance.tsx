import { useState } from "react";
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

const Attendance = () => {
  const { toast } = useToast();

  const courses = [
    { id: "CS101", name: "Data Structures" },
    { id: "CS102", name: "Algorithms" },
    { id: "CS103", name: "Database Systems" },
  ];

  const students = [
    { id: "S001", name: "John Doe", rollNumber: "2024001" },
    { id: "S002", name: "Jane Smith", rollNumber: "2024002" },
    { id: "S003", name: "Bob Johnson", rollNumber: "2024003" },
    { id: "S004", name: "Alice Brown", rollNumber: "2024004" },
    { id: "S005", name: "Charlie Wilson", rollNumber: "2024005" },
    { id: "S006", name: "Diana Martinez", rollNumber: "2024006" },
  ];

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleToggleAttendance = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleMarkAll = (status: boolean) => {
    const newAttendance: Record<string, boolean> = {};
    students.forEach(student => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSubmit = () => {
    if (!selectedCourse) {
      toast({
        title: "Course Required",
        description: "Please select a course before submitting attendance",
        variant: "destructive",
      });
      return;
    }

    const presentCount = Object.values(attendance).filter(Boolean).length;
    const totalStudents = students.length;

    toast({
      title: "Attendance Submitted",
      description: `Marked ${presentCount} out of ${totalStudents} students present for ${selectedDate}`,
    });

    setSubmitted(true);
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;
  const attendancePercentage = students.length > 0 
    ? ((presentCount / students.length) * 100).toFixed(1) 
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
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.id})
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
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.rollNumber}</TableCell>
                          <TableCell>{student.name}</TableCell>
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
                  <Button onClick={handleSubmit} disabled={submitted}>
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
