import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Trash2, Edit, Eye } from "lucide-react";
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
import { AddStudentDialog } from "@/components/admin/AddStudentDialog";
import { EditStudentDialog } from "@/components/admin/EditStudentDialog";
import { DeleteStudentDialog } from "@/components/admin/DeleteStudentDialog";
import { StudentDetailDialog } from "@/components/admin/StudentDetailDialog";

const Students = () => {
  // Mock data - will be replaced with Supabase data
  const [students, setStudents] = useState([
    { id: "S001", name: "John Doe", email: "john@example.com", phone: "+1234567890", enrollmentNumber: "EN2024001", course: "Computer Science", year: "2nd Year", status: "Active", dateOfBirth: "2002-05-15", address: "123 Main St, City", guardianName: "Jane Doe", guardianPhone: "+1234567891" },
    { id: "S002", name: "Jane Smith", email: "jane@example.com", phone: "+1234567892", enrollmentNumber: "EN2024002", course: "Information Technology", year: "3rd Year", status: "Active", dateOfBirth: "2001-08-22", address: "456 Oak Ave, Town", guardianName: "Bob Smith", guardianPhone: "+1234567893" },
    { id: "S003", name: "Bob Johnson", email: "bob@example.com", phone: "+1234567894", enrollmentNumber: "EN2024003", course: "Computer Science", year: "1st Year", status: "Active", dateOfBirth: "2003-12-10", address: "789 Pine Rd, Village", guardianName: "Alice Johnson", guardianPhone: "+1234567895" },
    { id: "S004", name: "Alice Brown", email: "alice@example.com", phone: "+1234567896", enrollmentNumber: "EN2024004", course: "Software Engineering", year: "4th Year", status: "Inactive", dateOfBirth: "2000-03-18", address: "321 Elm St, City", guardianName: "Charlie Brown", guardianPhone: "+1234567897" },
    { id: "S005", name: "Charlie Wilson", email: "charlie@example.com", phone: "+1234567898", enrollmentNumber: "EN2024005", course: "Data Science", year: "2nd Year", status: "Active", dateOfBirth: "2002-07-25", address: "654 Maple Dr, Town", guardianName: "Diana Wilson", guardianPhone: "+1234567899" },
    { id: "S006", name: "Diana Martinez", email: "diana@example.com", phone: "+1234567800", enrollmentNumber: "EN2024006", course: "Cyber Security", year: "3rd Year", status: "Active", dateOfBirth: "2001-11-30", address: "987 Cedar Ln, Village", guardianName: "Eduardo Martinez", guardianPhone: "+1234567801" },
    { id: "S007", name: "Edward Davis", email: "edward@example.com", phone: "+1234567802", enrollmentNumber: "EN2024007", course: "Computer Science", year: "1st Year", status: "Active", dateOfBirth: "2003-04-05", address: "147 Birch Ave, City", guardianName: "Fiona Davis", guardianPhone: "+1234567803" },
    { id: "S008", name: "Fiona Garcia", email: "fiona@example.com", phone: "+1234567804", enrollmentNumber: "EN2024008", course: "Information Technology", year: "4th Year", status: "Active", dateOfBirth: "2000-09-12", address: "258 Spruce St, Town", guardianName: "George Garcia", guardianPhone: "+1234567805" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search logic
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.enrollmentNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCourse = filterCourse === "all" || student.course === filterCourse;
      const matchesYear = filterYear === "all" || student.year === filterYear;
      const matchesStatus = filterStatus === "all" || student.status === filterStatus;
      
      return matchesSearch && matchesCourse && matchesYear && matchesStatus;
    });
  }, [students, searchQuery, filterCourse, filterYear, filterStatus]);

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCourse, filterYear, filterStatus]);

  // Dialog handlers
  const handleAddStudent = (newStudent: any) => {
    setStudents([...students, newStudent]);
  };

  const handleEditStudent = (updatedStudent: any) => {
    setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(students.filter(s => s.id !== studentId));
  };

  const handleViewDetails = (student: any) => {
    setSelectedStudent(student);
    setDetailDialogOpen(true);
  };

  const handleEditClick = (student: any) => {
    setSelectedStudent(student);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (student: any) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const courses = ["Computer Science", "Information Technology", "Software Engineering", "Data Science", "Cyber Security"];
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const statuses = ["Active", "Inactive", "Suspended", "Graduated"];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Students</h1>
            <p className="text-muted-foreground">Manage student records and enrollment</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, email, ID, or enrollment number..." 
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course</label>
                <Select value={filterCourse} onValueChange={setFilterCourse}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course} value={course}>{course}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
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
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
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
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No students found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === "Active" ? "default" : "secondary"}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(student)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditClick(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteClick(student)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredStudents.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-20 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
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

      {/* Dialogs */}
      <AddStudentDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onSubmit={handleAddStudent}
      />
      
      <EditStudentDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        student={selectedStudent}
        onSubmit={handleEditStudent}
      />
      
      <DeleteStudentDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        student={selectedStudent}
        onConfirm={handleDeleteStudent}
      />
      
      <StudentDetailDialog 
        open={detailDialogOpen} 
        onOpenChange={setDetailDialogOpen} 
        student={selectedStudent}
      />
    </DashboardLayout>
  );
};

export default Students;
