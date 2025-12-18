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
  faculty?: {
    id: string;
    full_name: string;
    email: string;
    department?: string;
  } | null;
  enrolled_count?: number;
}

export const useCourses = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      // Fetch courses with faculty info
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select(`
          *,
          faculty:faculties(id, full_name, email, department)
        `)
        .order("created_at", { ascending: false });

      if (coursesError) throw coursesError;

      // Fetch enrollment counts for each course
      const { data: enrollmentCounts, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("status", "enrolled");

      if (enrollmentError) throw enrollmentError;

      // Count enrollments per course
      const countMap: Record<string, number> = {};
      enrollmentCounts?.forEach((e) => {
        countMap[e.course_id] = (countMap[e.course_id] || 0) + 1;
      });

      // Merge enrollment counts into courses
      const coursesWithCounts = coursesData?.map((course) => ({
        ...course,
        enrolled_count: countMap[course.id] || 0,
      }));

      return coursesWithCounts as Course[];
    },
  });

  const createCourse = useMutation({
    mutationFn: async (newCourse: Omit<Course, "id" | "created_at" | "updated_at" | "faculty" | "enrolled_count">) => {
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
      // Remove nested objects that shouldn't be updated
      const { faculty, enrolled_count, ...cleanUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from("courses")
        .update(cleanUpdates)
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
