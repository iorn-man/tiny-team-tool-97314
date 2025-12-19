import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Grade {
  id: string;
  student_id: string;
  course_id: string;
  assessment_type: string;
  assessment_name: string;
  obtained_marks: number;
  max_marks: number;
  percentage?: number;
  grade_letter?: string;
  assessment_date?: string;
  notes?: string;
  entered_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const useGrades = (courseId?: string, studentId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: grades = [], isLoading } = useQuery({
    queryKey: ["grades", courseId, studentId],
    queryFn: async () => {
      let query = supabase.from("grades").select("*");
      
      if (courseId) query = query.eq("course_id", courseId);
      if (studentId) query = query.eq("student_id", studentId);
      
      const { data, error } = await query.order("assessment_date", { ascending: false });
      
      if (error) throw error;
      return data as Grade[];
    },
  });

  const createGrade = useMutation({
    mutationFn: async (newGrade: Omit<Grade, "id" | "created_at" | "updated_at" | "percentage">) => {
      // Don't include percentage - it's a generated column in the database
      const { data, error } = await supabase
        .from("grades")
        .insert([newGrade])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast({
        title: "Grade Added",
        description: "Grade has been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add grade",
        variant: "destructive",
      });
    },
  });

  const updateGrade = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Grade> & { id: string }) => {
      // Remove percentage from updates - it's a generated column
      const { percentage, ...safeUpdates } = updates;
      
      const { data, error } = await supabase
        .from("grades")
        .update(safeUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast({
        title: "Grade Updated",
        description: "Grade has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update grade",
        variant: "destructive",
      });
    },
  });

  const deleteGrade = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("grades")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast({
        title: "Grade Deleted",
        description: "Grade has been removed successfully",
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete grade",
        variant: "destructive",
      });
    },
  });

  return {
    grades,
    isLoading,
    createGrade,
    updateGrade,
    deleteGrade,
  };
};
