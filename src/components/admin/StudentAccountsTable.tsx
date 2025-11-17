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

export const StudentAccountsTable = () => {
  const { data: students, isLoading } = useQuery({
    queryKey: ["student-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, email, student_id, status, user_id")
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
            <TableHead>Student ID</TableHead>
            <TableHead>Email (Login ID)</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No student accounts found
              </TableCell>
            </TableRow>
          ) : (
            students?.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.full_name}</TableCell>
                <TableCell>{student.student_id}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell className="font-mono text-xs">{student.user_id || "N/A"}</TableCell>
                <TableCell>
                  <Badge
                    variant={student.status === "active" ? "default" : "secondary"}
                  >
                    {student.status}
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
