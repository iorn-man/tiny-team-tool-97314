import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  enrollment_date?: string;
  status: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useStudents = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Student[];
    },
  });

  const createStudent = useMutation({
    mutationFn: async (newStudent: Omit<Student, "id" | "created_at" | "updated_at">) => {
      // Check for unique constraints
      const { data: existingStudent } = await supabase
        .from("students")
        .select("student_id, email")
        .or(`student_id.eq.${newStudent.student_id},email.eq.${newStudent.email}`)
        .maybeSingle();

      if (existingStudent) {
        if (existingStudent.student_id === newStudent.student_id) {
          throw new Error("Student ID already exists");
        }
        if (existingStudent.email === newStudent.email) {
          throw new Error("Email already exists");
        }
      }

      const { data, error } = await supabase
        .from("students")
        .insert([newStudent])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Success",
        description: "Student added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive",
      });
    },
  });

  const updateStudent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Student> & { id: string }) => {
      const { data, error } = await supabase
        .from("students")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive",
      });
    },
  });

  const deleteStudent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      });
    },
  });

  return {
    students,
    isLoading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
  };
};
