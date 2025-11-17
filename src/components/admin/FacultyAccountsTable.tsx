import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared";

export const FacultyAccountsTable = () => {
  const { data: faculties, isLoading } = useQuery({
    queryKey: ["faculty-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faculties")
        .select("id, full_name, email, faculty_id, department, status, user_id")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Faculty ID</TableHead>
            <TableHead>Email (Login ID)</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {faculties?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No faculty accounts found
              </TableCell>
            </TableRow>
          ) : (
            faculties?.map((faculty) => (
              <TableRow key={faculty.id}>
                <TableCell className="font-medium">{faculty.full_name}</TableCell>
                <TableCell>{faculty.faculty_id}</TableCell>
                <TableCell>{faculty.email}</TableCell>
                <TableCell>{faculty.department}</TableCell>
                <TableCell className="font-mono text-xs">{faculty.user_id || "N/A"}</TableCell>
                <TableCell>
                  <Badge
                    variant={faculty.status === "active" ? "default" : "secondary"}
                  >
                    {faculty.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
