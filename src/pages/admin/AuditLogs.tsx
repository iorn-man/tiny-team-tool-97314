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
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { LoadingSkeleton } from "@/components/shared";

const AuditLogs = () => {
  const { logs, isLoading } = useAuditLogs();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterTable, setFilterTable] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Filter and search logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.table_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.record_id && log.record_id.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesAction = filterAction === "all" || log.action === filterAction;
      const matchesTable = filterTable === "all" || log.table_name === filterTable;

      return matchesSearch && matchesAction && matchesTable;
    });
  }, [logs, searchQuery, filterAction, filterTable]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, filterAction, filterTable]);

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      INSERT: "default",
      UPDATE: "secondary",
      DELETE: "destructive",
    };
    return variants[action] || "secondary";
  };

  const actions = ["INSERT", "UPDATE", "DELETE"];
  const tables = [...new Set(logs.map((log) => log.table_name))];

  if (isLoading) return <DashboardLayout role="admin"><LoadingSkeleton /></DashboardLayout>;

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
                placeholder="Search by action, table, or record ID..."
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
                <label className="text-sm font-medium">Table</label>
                <Select value={filterTable} onValueChange={setFilterTable}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Tables</SelectItem>
                    {tables.map((table) => (
                      <SelectItem key={table} value={table}>
                        {table}
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
                <TableHead>Action</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Record ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No logs found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {format(new Date(log.created_at), "MMM dd, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadge(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.table_name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.record_id ? log.record_id.slice(0, 8) + "..." : "-"}
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
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
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
                  <p className="text-sm">{format(new Date(selectedLog.created_at), "PPpp")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Action</p>
                  <Badge variant={getActionBadge(selectedLog.action)}>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Table</p>
                  <p className="text-sm">{selectedLog.table_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Record ID</p>
                  <p className="text-sm font-mono">{selectedLog.record_id || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                  <p className="text-sm font-mono">{selectedLog.ip_address || "-"}</p>
                </div>
              </div>

              {selectedLog.old_values && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Old Values</p>
                  <pre className="text-xs p-3 bg-muted rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">New Values</p>
                  <pre className="text-xs p-3 bg-muted rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AuditLogs;
