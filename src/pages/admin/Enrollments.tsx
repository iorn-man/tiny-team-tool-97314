import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useStudents } from "@/hooks/useStudents";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Enrollments = () => {
  const { toast } = useToast();
  const { enrollments, isLoading, createEnrollment, deleteEnrollment } = useEnrollments();
  const { students } = useStudents();
  const { courses } = useCourses();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    studentId: "",
    courseId: "",
  });

  // Filter and search logic
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment: any) => {
      const studentName = enrollment.students?.full_name || "";
      const courseName = enrollment.courses?.course_name || "";
      const matchesSearch = 
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCourse = filterCourse === "all" || enrollment.course_id === filterCourse;
      const matchesStatus = filterStatus === "all" || enrollment.status === filterStatus;
      
      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [enrollments, searchQuery, filterCourse, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);
  const paginatedEnrollments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEnrollments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEnrollments, currentPage, itemsPerPage]);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCourse, filterStatus]);

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.courseId) {
      toast({
        title: "Validation Error",
        description: "Please select both student and course",
        variant: "destructive",
      });
      return;
    }

    // Check if already enrolled
    const existing = enrollments.find((e: any) => 
      e.student_id === formData.studentId && e.course_id === formData.courseId && e.status === "enrolled"
    );

    if (existing) {
      toast({
        title: "Already Enrolled",
        description: "This student is already enrolled in this course",
        variant: "destructive",
      });
      return;
    }

    createEnrollment.mutate({
      student_id: formData.studentId,
      course_id: formData.courseId,
    });
    
    setFormData({ studentId: "", courseId: "" });
    setAddDialogOpen(false);
  };

  const handleUnenroll = () => {
    if (selectedEnrollment) {
      deleteEnrollment.mutate(selectedEnrollment.id);
      setDeleteDialogOpen(false);
      setSelectedEnrollment(null);
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
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Course Enrollments</h1>
            <p className="text-muted-foreground">Manage student course registrations</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Enroll Student
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by student, course, or enrollment ID..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course</label>
                <Select value={filterCourse} onValueChange={setFilterCourse}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>{course.course_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enrollment ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Enrolled Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEnrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No enrollments found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEnrollments.map((enrollment: any) => (
                  <TableRow key={enrollment.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{enrollment.id}</TableCell>
                    <TableCell>{enrollment.students?.full_name || "N/A"}</TableCell>
                    <TableCell>{enrollment.courses?.course_name || "N/A"}</TableCell>
                    <TableCell>Semester {enrollment.courses?.semester || "N/A"}</TableCell>
                    <TableCell>{enrollment.enrollment_date || new Date().toISOString().split('T')[0]}</TableCell>
                    <TableCell>
                      <Badge variant={enrollment.status === "enrolled" ? "default" : "secondary"}>
                        {enrollment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        {enrollment.status === "enrolled" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredEnrollments.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-20 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEnrollments.length)} of {filteredEnrollments.length} enrollments
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
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
      </div>

      {/* Enroll Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Enroll Student in Course</DialogTitle>
            <DialogDescription>
              Select a student and course for enrollment
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEnroll} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student *</Label>
              <Select value={formData.studentId} onValueChange={(value) => setFormData({ ...formData, studentId: value })}>
                <SelectTrigger id="student" className="bg-background">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {students.map((student: any) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} ({student.student_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })}>
                <SelectTrigger id="course" className="bg-background">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.course_name} (Semester {course.semester})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Enroll Student</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unenroll Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Unenroll Student?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unenroll <span className="font-semibold">{selectedEnrollment?.students?.full_name}</span> from{" "}
              <span className="font-semibold">{selectedEnrollment?.courses?.course_name}</span>? This will mark the enrollment as dropped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnenroll} className="bg-destructive hover:bg-destructive/90">
              Unenroll
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Enrollments;
