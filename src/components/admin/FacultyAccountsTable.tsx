import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { EditFacultyAccountDialog } from "./EditFacultyAccountDialog";

interface Faculty {
  id: string;
  full_name: string;
  email: string;
  faculty_id: string;
  department: string | null;
  status: string | null;
  password: string | null;
}

export const FacultyAccountsTable = () => {
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  
  const { data: faculties, isLoading } = useQuery({
    queryKey: ["faculty-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faculties")
        .select("id, full_name, email, faculty_id, department, status, password")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Faculty[];
    },
  });

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleEdit = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setEditDialogOpen(true);
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Faculty ID</TableHead>
              <TableHead>Email (Login ID)</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faculties?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {visiblePasswords.has(faculty.id) 
                          ? faculty.password || "Not set"
                          : "••••••••"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility(faculty.id)}
                        className="h-8 w-8 p-0"
                      >
                        {visiblePasswords.has(faculty.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={faculty.status === "active" ? "default" : "secondary"}
                    >
                      {faculty.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(faculty)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditFacultyAccountDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        faculty={selectedFaculty}
      />
    </>
  );
};
