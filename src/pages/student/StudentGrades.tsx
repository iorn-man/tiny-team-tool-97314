import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

const StudentGrades = () => {
  const [selectedCourse, setSelectedCourse] = useState("all");

  // Mock grades data
  const courseGrades = [
    {
      course: "CS101 - Introduction to Programming",
      assignments: [
        { name: "Assignment 1", score: 95, maxScore: 100, weight: 20 },
        { name: "Assignment 2", score: 88, maxScore: 100, weight: 20 },
        { name: "Mid-term Exam", score: 85, maxScore: 100, weight: 30 },
      ],
      currentGrade: "A",
      percentage: 89.3,
    },
    {
      course: "CS201 - Data Structures",
      assignments: [
        { name: "Assignment 1", score: 82, maxScore: 100, weight: 25 },
        { name: "Quiz 1", score: 90, maxScore: 100, weight: 15 },
        { name: "Mid-term Exam", score: 78, maxScore: 100, weight: 30 },
      ],
      currentGrade: "B+",
      percentage: 82.5,
    },
    {
      course: "MATH201 - Calculus II",
      assignments: [
        { name: "Assignment 1", score: 92, maxScore: 100, weight: 20 },
        { name: "Assignment 2", score: 95, maxScore: 100, weight: 20 },
        { name: "Mid-term Exam", score: 88, maxScore: 100, weight: 30 },
      ],
      currentGrade: "A-",
      percentage: 90.7,
    },
  ];

  const getGradeBadge = (grade: string) => {
    const gradeColors: Record<string, string> = {
      "A": "default",
      "A-": "default",
      "B+": "secondary",
      "B": "secondary",
      "C": "secondary",
    };
    return <Badge variant={gradeColors[grade] as any}>{grade}</Badge>;
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Grades</h1>
          <p className="text-muted-foreground">View your grades and academic performance</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {courseGrades.map((course, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{course.course.split(" - ")[0]}</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">{course.currentGrade}</div>
                  <span className={`text-sm font-medium ${getPercentageColor(course.percentage)}`}>
                    {course.percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={course.percentage} className="mt-2 h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {course.assignments.length} assessments
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Grades</CardTitle>
            <CardDescription>Assessment-wise breakdown of your grades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="cs101">CS101 - Introduction to Programming</SelectItem>
                  <SelectItem value="cs201">CS201 - Data Structures</SelectItem>
                  <SelectItem value="math201">MATH201 - Calculus II</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              {courseGrades.map((course, courseIndex) => (
                <div key={courseIndex} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{course.course}</h3>
                    <div className="flex items-center gap-2">
                      {getGradeBadge(course.currentGrade)}
                      <span className={`font-bold ${getPercentageColor(course.percentage)}`}>
                        {course.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assessment</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {course.assignments.map((assignment, assignmentIndex) => {
                        const percentage = (assignment.score / assignment.maxScore) * 100;
                        return (
                          <TableRow key={assignmentIndex}>
                            <TableCell>{assignment.name}</TableCell>
                            <TableCell>
                              {assignment.score}/{assignment.maxScore}
                            </TableCell>
                            <TableCell>{assignment.weight}%</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={getPercentageColor(percentage)}>
                                  {percentage.toFixed(1)}%
                                </span>
                                {percentage >= 85 && <TrendingUp className="h-4 w-4 text-green-600" />}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentGrades;
