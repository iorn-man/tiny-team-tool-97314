import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  role: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  status: "success" | "failed";
}

const AuditLogs = () => {
  // Mock data
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: "AL001",
      timestamp: new Date("2024-03-15T10:30:00"),
      user: "admin@institute.com",
      role: "Admin",
      action: "CREATE",
      resource: "Student",
      details: "Created new student record: John Doe (EN2024001)",
      ipAddress: "192.168.1.100",
      status: "success",
    },
    {
      id: "AL002",
      timestamp: new Date("2024-03-15T10:25:00"),
      user: "faculty@institute.com",
      role: "Faculty",
      action: "UPDATE",
      resource: "Attendance",
      details: "Marked attendance for CSE101 - 30 students present",
      ipAddress: "192.168.1.105",
      status: "success",
    },
    {
      id: "AL003",
      timestamp: new Date("2024-03-15T10:20:00"),
      user: "admin@institute.com",
      role: "Admin",
      action: "DELETE",
      resource: "Course",
      details: "Deleted course: Advanced Algorithms (CS401)",
      ipAddress: "192.168.1.100",
      status: "success",
    },
    {
      id: "AL004",
      timestamp: new Date("2024-03-15T10:15:00"),
      user: "student@institute.com",
      role: "Student",
      action: "LOGIN",
      resource: "Authentication",
      details: "User login failed - invalid credentials",
      ipAddress: "192.168.1.120",
      status: "failed",
    },
    {
      id: "AL005",
      timestamp: new Date("2024-03-15T10:10:00"),
      user: "faculty@institute.com",
      role: "Faculty",
      action: "CREATE",
      resource: "Announcement",
      details: "Posted announcement: Midterm exam schedule updated",
      ipAddress: "192.168.1.105",
      status: "success",
    },
    {
      id: "AL006",
      timestamp: new Date("2024-03-15T10:05:00"),
      user: "admin@institute.com",
      role: "Admin",
      action: "UPDATE",
      resource: "Faculty",
      details: "Updated faculty profile: Dr. Smith - Department changed to CS",
      ipAddress: "192.168.1.100",
      status: "success",
    },
    {
      id: "AL007",
      timestamp: new Date("2024-03-15T10:00:00"),
      user: "student@institute.com",
      role: "Student",
      action: "VIEW",
      resource: "Grades",
      details: "Accessed grade report for semester 2024-1",
      ipAddress: "192.168.1.121",
      status: "success",
    },
    {
      id: "AL008",
      timestamp: new Date("2024-03-15T09:55:00"),
      user: "faculty@institute.com",
      role: "Faculty",
      action: "UPDATE",
      resource: "Grades",
      details: "Updated grades for CSE202 - Assignment 3",
      ipAddress: "192.168.1.105",
      status: "success",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterUser, setFilterUser] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Filter and search logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUser = filterUser === "all" || log.role === filterUser;
      const matchesAction = filterAction === "all" || log.action === filterAction;
      const matchesStatus = filterStatus === "all" || log.status === filterStatus;

      return matchesSearch && matchesUser && matchesAction && matchesStatus;
    });
  }, [logs, searchQuery, filterUser, filterAction, filterStatus]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, filterUser, filterAction, filterStatus]);

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const roles = ["Admin", "Faculty", "Student"];
  const actions = ["CREATE", "UPDATE", "DELETE", "VIEW", "LOGIN", "LOGOUT"];
  const statuses = ["success", "failed"];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">Track all system activities and user actions</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, resource, or details..."
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
                <label className="text-sm font-medium">User Role</label>
                <Select value={filterUser} onValueChange={setFilterUser}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Action Type</label>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Actions</SelectItem>
                    {actions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
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
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
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
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No logs found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {format(log.timestamp, "MMM dd, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.action === "DELETE"
                            ? "destructive"
                            : log.action === "CREATE"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.resource}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === "success" ? "default" : "destructive"}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(log)}
                        >
                          <Eye className="h-4 w-4" />
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
        {filteredLogs.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-20 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of{" "}
                {filteredLogs.length} logs
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl bg-background">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>Complete information about this audit entry</DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Log ID</p>
                  <p className="text-sm font-mono">{selectedLog.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                  <p className="text-sm">{format(selectedLog.timestamp, "PPpp")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User</p>
                  <p className="text-sm">{selectedLog.user}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <p className="text-sm">{selectedLog.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Action</p>
                  <Badge
                    variant={
                      selectedLog.action === "DELETE"
                        ? "destructive"
                        : selectedLog.action === "CREATE"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resource</p>
                  <p className="text-sm">{selectedLog.resource}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge
                    variant={selectedLog.status === "success" ? "default" : "destructive"}
                  >
                    {selectedLog.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                  <p className="text-sm font-mono">{selectedLog.ipAddress}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Details</p>
                <p className="text-sm p-3 bg-muted rounded-lg">{selectedLog.details}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AuditLogs;