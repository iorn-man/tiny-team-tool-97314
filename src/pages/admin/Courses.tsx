import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreVertical, Eye, Pencil, Trash2, Upload } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { LoadingSkeleton } from "@/components/shared";
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
import { CSVImportDialog } from "@/components/admin/CSVImportDialog";

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
  const { courses, isLoading, createCourse, updateCourse, deleteCourse } = useCourses();
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const filteredCourses = courses.filter(
    (course) =>
      course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.course_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCourse = (courseData: any) => {
    createCourse.mutate(courseData);
  };

  const handleEditCourse = (courseData: any) => {
    updateCourse.mutate({ id: selectedCourse.id, ...courseData });
  };

  const handleDeleteCourse = (courseId: string) => {
    deleteCourse.mutate(courseId);
  };

  const handleCSVImport = async (data: any[]) => {
    for (const row of data) {
      try {
        await createCourse.mutateAsync(row);
      } catch (error) {
        console.error("Error importing row:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCsvImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </div>
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
                  <TableCell className="font-medium">{course.course_code}</TableCell>
                  <TableCell>{course.course_name}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>Faculty Assigned</TableCell>
                  <TableCell>Semester {course.semester || "N/A"}</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>
                    <Badge variant={course.status === "active" ? "default" : "secondary"}>
                      {course.status || "active"}
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

      <CSVImportDialog
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        onImport={handleCSVImport}
        type="courses"
      />
    </DashboardLayout>
  );
};

export default Courses;
