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
import { useToast } from "@/hooks/use-toast";
import { Save, Award, FileText } from "lucide-react";
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
import { useGrades } from "@/hooks/useGrades";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EnrolledStudent {
  id: string;
  full_name: string;
  student_id: string;
}

const Grades = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses();
  const { createGrade } = useGrades();

  const [facultyCourses, setFacultyCourses] = useState<typeof courses>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const assessmentTypes = [
    { id: "midterm", name: "Midterm Exam", maxMarks: 100 },
    { id: "final", name: "Final Exam", maxMarks: 100 },
    { id: "assignment1", name: "Assignment 1", maxMarks: 50 },
    { id: "assignment2", name: "Assignment 2", maxMarks: 50 },
    { id: "project", name: "Project", maxMarks: 100 },
    { id: "quiz1", name: "Quiz 1", maxMarks: 25 },
    { id: "quiz2", name: "Quiz 2", maxMarks: 25 },
  ];

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
    setGrades({});
    setSubmitted(false);
  }, [selectedCourse]);

  const selectedAssessmentData = assessmentTypes.find(a => a.id === selectedAssessment);

  const handleGradeChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value);
    const maxMarks = selectedAssessmentData?.maxMarks || 100;
    
    if (value === "" || (numValue >= 0 && numValue <= maxMarks)) {
      setGrades(prev => ({
        ...prev,
        [studentId]: value
      }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedCourse || !selectedAssessment) {
      toast({
        title: "Selection Required",
        description: "Please select both course and assessment type",
        variant: "destructive",
      });
      return;
    }

    const missingGrades = enrolledStudents.filter(s => !grades[s.id] || grades[s.id] === "");
    if (missingGrades.length > 0) {
      toast({
        title: "Incomplete Grades",
        description: `Please enter grades for all students (${missingGrades.length} missing)`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      for (const student of enrolledStudents) {
        const marks = parseFloat(grades[student.id]);
        const maxMarks = selectedAssessmentData?.maxMarks || 100;
        
        await createGrade.mutateAsync({
          student_id: student.id,
          course_id: selectedCourse,
          assessment_type: selectedAssessment,
          assessment_name: selectedAssessmentData?.name || selectedAssessment,
          obtained_marks: marks,
          max_marks: maxMarks,
          entered_by: user?.id,
        });
      }

      toast({
        title: "Grades Submitted",
        description: `Grades have been recorded for ${selectedAssessmentData?.name}`,
      });
      setSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit grades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (marks: string) => {
    const maxMarks = selectedAssessmentData?.maxMarks || 100;
    const percentage = (parseFloat(marks) / maxMarks) * 100;
    
    if (percentage >= 90) return "text-success";
    if (percentage >= 75) return "text-primary";
    if (percentage >= 60) return "text-warning";
    return "text-destructive";
  };

  const getGradeLetter = (marks: string) => {
    const maxMarks = selectedAssessmentData?.maxMarks || 100;
    const percentage = (parseFloat(marks) / maxMarks) * 100;
    
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

  const calculateStats = () => {
    const validGrades = Object.values(grades).filter(g => g !== "").map(g => parseFloat(g));
    if (validGrades.length === 0) return { average: 0, highest: 0, lowest: 0 };

    const average = validGrades.reduce((a, b) => a + b, 0) / validGrades.length;
    const highest = Math.max(...validGrades);
    const lowest = Math.min(...validGrades);

    return { average, highest, lowest };
  };

  const stats = calculateStats();

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Manage Grades</h1>
          <p className="text-muted-foreground">Enter and update student grades for assessments</p>
        </div>

        {selectedCourse && selectedAssessment && Object.values(grades).some(g => g !== "") && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.average.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-success/10">
                    <Award className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">{stats.highest}</p>
                    <p className="text-sm text-muted-foreground">Highest Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-destructive/10">
                    <FileText className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-destructive">{stats.lowest}</p>
                    <p className="text-sm text-muted-foreground">Lowest Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Grade Entry</CardTitle>
            <CardDescription>Select course and assessment type to enter grades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course">Select Course *</Label>
                <Select value={selectedCourse} onValueChange={(value) => {
                  setSelectedCourse(value);
                  setSubmitted(false);
                }}>
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
                <Label htmlFor="assessment">Assessment Type *</Label>
                <Select value={selectedAssessment} onValueChange={(value) => {
                  setSelectedAssessment(value);
                  setSubmitted(false);
                }}>
                  <SelectTrigger id="assessment" className="bg-background">
                    <SelectValue placeholder="Choose assessment" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {assessmentTypes.map(assessment => (
                      <SelectItem key={assessment.id} value={assessment.id}>
                        {assessment.name} (Max: {assessment.maxMarks})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedCourse && selectedAssessment && (
              <>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-sm">
                    <span className="font-medium">Assessment:</span> {selectedAssessmentData?.name} | 
                    <span className="font-medium"> Max Marks:</span> {selectedAssessmentData?.maxMarks}
                  </p>
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
                          <TableHead>Marks Obtained</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead className="text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrolledStudents.map((student) => {
                          const marks = grades[student.id] || "";
                          const percentage = marks 
                            ? ((parseFloat(marks) / (selectedAssessmentData?.maxMarks || 100)) * 100).toFixed(1)
                            : "-";
                          const gradeLetter = marks ? getGradeLetter(marks) : "-";

                          return (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">{student.student_id}</TableCell>
                              <TableCell>{student.full_name}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max={selectedAssessmentData?.maxMarks}
                                  step="0.5"
                                  value={marks}
                                  onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                  placeholder="0"
                                  className="w-24"
                                />
                              </TableCell>
                              <TableCell>
                                {marks && (
                                  <Badge variant="outline" className={getGradeColor(marks)}>
                                    {gradeLetter}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={marks ? getGradeColor(marks) : ""}>
                                  {percentage}%
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGrades({});
                      setSubmitted(false);
                    }}
                  >
                    Clear All
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitted || loading || enrolledStudents.length === 0}>
                    <Save className="h-4 w-4 mr-2" />
                    {submitted ? "Submitted" : "Submit Grades"}
                  </Button>
                </div>

                {submitted && (
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-sm text-success font-medium">
                      ✓ Grades have been recorded successfully for {selectedAssessmentData?.name}
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

export default Grades;
