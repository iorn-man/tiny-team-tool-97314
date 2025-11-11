import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AddCourseDialog } from "@/components/admin/AddCourseDialog";
import { EditCourseDialog } from "@/components/admin/EditCourseDialog";
import { DeleteCourseDialog } from "@/components/admin/DeleteCourseDialog";
import { CourseDetailDialog } from "@/components/admin/CourseDetailDialog";

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  faculty: string;
  facultyId: string;
  semester: string;
  status: "active" | "inactive";
  enrolledStudents: number;
}

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [courses, setCourses] = useState<Course[]>([
    {
      id: "C001",
      code: "CS101",
      name: "Introduction to Programming",
      credits: 4,
      faculty: "Dr. John Smith",
      facultyId: "F001",
      semester: "Fall 2024",
      status: "active",
      enrolledStudents: 45,
    },
    {
      id: "C002",
      code: "MATH201",
      name: "Calculus II",
      credits: 3,
      faculty: "Dr. Sarah Johnson",
      facultyId: "F002",
      semester: "Fall 2024",
      status: "active",
      enrolledStudents: 38,
    },
    {
      id: "C003",
      code: "ENG101",
      name: "English Composition",
      credits: 3,
      faculty: "Prof. Michael Brown",
      facultyId: "F003",
      semester: "Fall 2024",
      status: "inactive",
      enrolledStudents: 0,
    },
  ]);

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.faculty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCourse = (courseData: any) => {
    const newCourse: Course = {
      id: "C" + String(courses.length + 1).padStart(3, "0"),
      ...courseData,
      enrolledStudents: 0,
    };
    setCourses([...courses, newCourse]);
  };

  const handleEditCourse = (courseData: any) => {
    setCourses(
      courses.map((c) =>
        c.id === selectedCourse?.id ? { ...c, ...courseData } : c
      )
    );
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter((c) => c.id !== courseId));
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Course Management</h1>
            <p className="text-muted-foreground">
              Manage courses, assign faculty, and track enrollments
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.code}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>{course.faculty}</TableCell>
                  <TableCell>{course.semester}</TableCell>
                  <TableCell>{course.enrolledStudents}</TableCell>
                  <TableCell>
                    <Badge variant={course.status === "active" ? "default" : "secondary"}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCourse(course);
                            setDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCourse(course);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCourse(course);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddCourseDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddCourse}
      />

      <EditCourseDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        course={selectedCourse}
        onEdit={handleEditCourse}
      />

      <DeleteCourseDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        course={selectedCourse}
        onConfirm={handleDeleteCourse}
      />

      <CourseDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        course={selectedCourse}
      />
    </DashboardLayout>
  );
};

export default Courses;
