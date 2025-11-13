import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Course {
  id: string;
  course_code: string;
  course_name: string;
  description?: string;
  credits: number;
  department?: string;
  semester?: number;
  faculty_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCourses = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Course[];
    },
  });

  const createCourse = useMutation({
    mutationFn: async (newCourse: Omit<Course, "id" | "created_at" | "updated_at">) => {
      // Check for unique course code
      const { data: existingCourse } = await supabase
        .from("courses")
        .select("course_code")
        .eq("course_code", newCourse.course_code)
        .maybeSingle();

      if (existingCourse) {
        throw new Error("Course code already exists");
      }

      const { data, error } = await supabase
        .from("courses")
        .insert([newCourse])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({
        title: "Course Added",
        description: "Course has been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add course",
        variant: "destructive",
      });
    },
  });

  const updateCourse = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Course> & { id: string }) => {
      const { data, error } = await supabase
        .from("courses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({
        title: "Course Updated",
        description: "Course has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({
        title: "Course Deleted",
        description: "Course has been removed successfully",
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  return {
    courses,
    isLoading,
    createCourse,
    updateCourse,
    deleteCourse,
  };
};
