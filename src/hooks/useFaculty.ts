import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Faculty {
  id: string;
  faculty_id: string;
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  qualification?: string;
  specialization?: string;
  joining_date?: string;
  status?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useFaculty = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: faculty = [], isLoading } = useQuery({
    queryKey: ["faculty"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faculties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Faculty[];
    },
  });

  const createFaculty = useMutation({
    mutationFn: async (newFaculty: Omit<Faculty, "id" | "created_at" | "updated_at">) => {
      // Check for unique constraints
      const { data: existingFaculty } = await supabase
        .from("faculties")
        .select("faculty_id, email")
        .or(`faculty_id.eq.${newFaculty.faculty_id},email.eq.${newFaculty.email}`)
        .maybeSingle();

      if (existingFaculty) {
        if (existingFaculty.faculty_id === newFaculty.faculty_id) {
          throw new Error("Faculty ID already exists");
        }
        if (existingFaculty.email === newFaculty.email) {
          throw new Error("Email already exists");
        }
      }

      const { data, error } = await supabase
        .from("faculties")
        .insert([newFaculty])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
      toast({
        title: "Faculty Added",
        description: "Faculty member has been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add faculty member",
        variant: "destructive",
      });
    },
  });

  const updateFaculty = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Faculty> & { id: string }) => {
      const { data, error } = await supabase
        .from("faculties")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
      toast({
        title: "Faculty Updated",
        description: "Faculty member has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update faculty member",
        variant: "destructive",
      });
    },
  });

  const deleteFaculty = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("faculties")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
      toast({
        title: "Faculty Deleted",
        description: "Faculty member has been removed successfully",
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete faculty member",
        variant: "destructive",
      });
    },
  });

  return {
    faculty,
    isLoading,
    createFaculty,
    updateFaculty,
    deleteFaculty,
  };
};
