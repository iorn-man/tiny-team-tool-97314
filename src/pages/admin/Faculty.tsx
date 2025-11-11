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
import { AddFacultyDialog } from "@/components/admin/AddFacultyDialog";
import { EditFacultyDialog } from "@/components/admin/EditFacultyDialog";
import { DeleteFacultyDialog } from "@/components/admin/DeleteFacultyDialog";
import { FacultyDetailDialog } from "@/components/admin/FacultyDetailDialog";

const Faculty = () => {
  // Mock data - will be replaced with Supabase data
  const [faculty, setFaculty] = useState([
    { id: "F001", name: "Dr. Sarah Johnson", email: "sarah.j@institute.edu", phone: "+1234567890", employeeId: "EMP2024001", department: "Computer Science", qualification: "Ph.D.", specialization: "Machine Learning", dateOfJoining: "2020-01-15", address: "123 Oak St, City", emergencyContact: "+1234567891", emergencyContactName: "Mike Johnson", status: "Active" },
    { id: "F002", name: "Prof. Michael Chen", email: "michael.c@institute.edu", phone: "+1234567892", employeeId: "EMP2024002", department: "Information Technology", qualification: "Ph.D.", specialization: "Cloud Computing", dateOfJoining: "2019-08-20", address: "456 Pine Ave, Town", emergencyContact: "+1234567893", emergencyContactName: "Lisa Chen", status: "Active" },
    { id: "F003", name: "Dr. Emily Davis", email: "emily.d@institute.edu", phone: "+1234567894", employeeId: "EMP2024003", department: "Software Engineering", qualification: "M.Tech", specialization: "Software Architecture", dateOfJoining: "2021-03-10", address: "789 Maple Dr, Village", emergencyContact: "+1234567895", emergencyContactName: "Robert Davis", status: "Active" },
    { id: "F004", name: "Prof. James Wilson", email: "james.w@institute.edu", phone: "+1234567896", employeeId: "EMP2024004", department: "Data Science", qualification: "Ph.D.", specialization: "Big Data Analytics", dateOfJoining: "2018-06-25", address: "321 Elm St, City", emergencyContact: "+1234567897", emergencyContactName: "Emma Wilson", status: "On Leave" },
    { id: "F005", name: "Dr. Priya Sharma", email: "priya.s@institute.edu", phone: "+1234567898", employeeId: "EMP2024005", department: "Cyber Security", qualification: "Ph.D.", specialization: "Network Security", dateOfJoining: "2022-01-05", address: "654 Cedar Ln, Town", emergencyContact: "+1234567899", emergencyContactName: "Raj Sharma", status: "Active" },
    { id: "F006", name: "Prof. David Martinez", email: "david.m@institute.edu", phone: "+1234567800", employeeId: "EMP2024006", department: "Computer Science", qualification: "M.Sc", specialization: "Algorithms", dateOfJoining: "2020-09-15", address: "987 Birch Ave, Village", emergencyContact: "+1234567801", emergencyContactName: "Maria Martinez", status: "Active" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterQualification, setFilterQualification] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search logic
  const filteredFaculty = useMemo(() => {
    return faculty.filter((member) => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = filterDepartment === "all" || member.department === filterDepartment;
      const matchesQualification = filterQualification === "all" || member.qualification === filterQualification;
      const matchesStatus = filterStatus === "all" || member.status === filterStatus;
      
      return matchesSearch && matchesDepartment && matchesQualification && matchesStatus;
    });
  }, [faculty, searchQuery, filterDepartment, filterQualification, filterStatus]);

  // Pagination logic
  const totalPages = Math.ceil(filteredFaculty.length / itemsPerPage);
  const paginatedFaculty = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFaculty.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFaculty, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDepartment, filterQualification, filterStatus]);

  // Dialog handlers
  const handleAddFaculty = (newFaculty: any) => {
    setFaculty([...faculty, newFaculty]);
  };

  const handleEditFaculty = (updatedFaculty: any) => {
    setFaculty(faculty.map(f => f.id === updatedFaculty.id ? updatedFaculty : f));
  };

  const handleDeleteFaculty = (facultyId: string) => {
    setFaculty(faculty.filter(f => f.id !== facultyId));
  };

  const handleViewDetails = (member: any) => {
    setSelectedFaculty(member);
    setDetailDialogOpen(true);
  };

  const handleEditClick = (member: any) => {
    setSelectedFaculty(member);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (member: any) => {
    setSelectedFaculty(member);
    setDeleteDialogOpen(true);
  };

  const departments = ["Computer Science", "Information Technology", "Software Engineering", "Data Science", "Cyber Security", "Mathematics", "Physics"];
  const qualifications = ["Ph.D.", "M.Tech", "M.Sc", "M.E.", "MBA", "B.Tech"];
  const statuses = ["Active", "On Leave", "Inactive", "Retired"];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Faculty Members</h1>
            <p className="text-muted-foreground">Manage faculty records and assignments</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Faculty
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, email, ID, employee ID, or department..." 
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
                <label className="text-sm font-medium">Department</label>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Qualification</label>
                <Select value={filterQualification} onValueChange={setFilterQualification}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Qualifications</SelectItem>
                    {qualifications.map(qual => (
                      <SelectItem key={qual} value={qual}>{qual}</SelectItem>
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
                <TableHead>Faculty ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFaculty.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No faculty members found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFaculty.map((member) => (
                  <TableRow key={member.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{member.id}</TableCell>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.department}</TableCell>
                    <TableCell>{member.qualification}</TableCell>
                    <TableCell>
                      <Badge variant={member.status === "Active" ? "default" : "secondary"}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(member)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditClick(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteClick(member)}
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
        {filteredFaculty.length > 0 && (
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredFaculty.length)} of {filteredFaculty.length} faculty members
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
      <AddFacultyDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onSubmit={handleAddFaculty}
      />
      
      <EditFacultyDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        faculty={selectedFaculty}
        onSubmit={handleEditFaculty}
      />
      
      <DeleteFacultyDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        faculty={selectedFaculty}
        onConfirm={handleDeleteFaculty}
      />
      
      <FacultyDetailDialog 
        open={detailDialogOpen} 
        onOpenChange={setDetailDialogOpen} 
        faculty={selectedFaculty}
      />
    </DashboardLayout>
  );
};

export default Faculty;
