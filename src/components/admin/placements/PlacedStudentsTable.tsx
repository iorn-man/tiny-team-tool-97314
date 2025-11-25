import { usePlacedStudents } from "@/hooks/usePlacedStudents";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, DollarSign } from "lucide-react";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { format } from "date-fns";

export const PlacedStudentsTable = () => {
  const { data: placements, isLoading } = usePlacedStudents();

  if (isLoading) {
    return <LoadingSkeleton count={5} />;
  }

  if (!placements || placements.length === 0) {
    return <EmptyState message="No placement records found" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Placement Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {placements.map((placement) => (
              <TableRow key={placement.id}>
                <TableCell className="font-medium">{placement.students?.full_name}</TableCell>
                <TableCell>{placement.students?.student_id}</TableCell>
                <TableCell>{placement.companies?.company_name}</TableCell>
                <TableCell>{placement.position}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    {placement.package_offered} LPA
                  </div>
                </TableCell>
                <TableCell>{format(new Date(placement.placement_date), "MMM dd, yyyy")}</TableCell>
                <TableCell>
                  <Badge variant={placement.status === "placed" ? "default" : "secondary"}>
                    {placement.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
