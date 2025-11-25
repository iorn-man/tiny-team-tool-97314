import { usePlacementSchedule } from "@/hooks/usePlacementSchedule";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Clock } from "lucide-react";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { format } from "date-fns";

export const PlacementScheduleTable = () => {
  const { data: schedules, isLoading } = usePlacementSchedule();

  if (isLoading) {
    return <LoadingSkeleton count={5} />;
  }

  if (!schedules || schedules.length === 0) {
    return <EmptyState message="No placement drives scheduled" />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="default">Scheduled</Badge>;
      case "ongoing":
        return <Badge className="bg-green-500">Ongoing</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>Eligible Branches</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell className="font-medium">{schedule.companies?.company_name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {format(new Date(schedule.drive_date), "MMM dd, yyyy")}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {schedule.drive_time}
                </div>
              </TableCell>
              <TableCell>{schedule.venue}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {schedule.eligible_branches?.slice(0, 2).map((branch) => (
                    <Badge key={branch} variant="outline" className="text-xs">
                      {branch}
                    </Badge>
                  ))}
                  {schedule.eligible_branches && schedule.eligible_branches.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{schedule.eligible_branches.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(schedule.status || "scheduled")}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
