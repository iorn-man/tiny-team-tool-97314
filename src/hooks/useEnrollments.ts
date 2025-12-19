import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrollment_date?: string;
  status?: string;
  grade?: string;
  created_at?: string;
  updated_at?: string;
}

export const useEnrollments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          *,
          students!enrollments_student_id_fkey(id, student_id, full_name),
          courses!enrollments_course_id_fkey(id, course_code, course_name, semester)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createEnrollment = useMutation({
    mutationFn: async (newEnrollment: { student_id: string; course_id: string }) => {
      // First check if enrollment already exists (including dropped)
      const { data: existing } = await supabase
        .from("enrollments")
        .select("id, status")
        .eq("student_id", newEnrollment.student_id)
        .eq("course_id", newEnrollment.course_id)
        .maybeSingle();

      if (existing) {
        if (existing.status === "enrolled") {
          throw new Error("Student is already enrolled in this course");
        }
        // Re-enroll by updating status
        const { data, error } = await supabase
          .from("enrollments")
          .update({ status: "enrolled", enrollment_date: new Date().toISOString().split('T')[0] })
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      // Create new enrollment
      const { data, error } = await supabase
        .from("enrollments")
        .insert([{ ...newEnrollment, status: "enrolled" }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast({
        title: "Student Enrolled",
        description: "Student has been enrolled successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to enroll student",
        variant: "destructive",
      });
    },
  });

  const bulkCreateEnrollment = useMutation({
    mutationFn: async ({ course_id, student_ids }: { course_id: string; student_ids: string[] }) => {
      const results = { success: 0, skipped: 0, errors: 0 };

      for (const student_id of student_ids) {
        try {
          // Check if enrollment already exists
          const { data: existing } = await supabase
            .from("enrollments")
            .select("id, status")
            .eq("student_id", student_id)
            .eq("course_id", course_id)
            .maybeSingle();

          if (existing) {
            if (existing.status === "enrolled") {
              results.skipped++;
              continue;
            }
            // Re-enroll by updating status
            await supabase
              .from("enrollments")
              .update({ status: "enrolled", enrollment_date: new Date().toISOString().split('T')[0] })
              .eq("id", existing.id);
            results.success++;
          } else {
            // Create new enrollment
            const { error } = await supabase
              .from("enrollments")
              .insert([{ student_id, course_id, status: "enrolled" }]);
            if (error) throw error;
            results.success++;
          }
        } catch {
          results.errors++;
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      const messages = [];
      if (results.success > 0) messages.push(`${results.success} enrolled`);
      if (results.skipped > 0) messages.push(`${results.skipped} already enrolled`);
      if (results.errors > 0) messages.push(`${results.errors} failed`);
      
      toast({
        title: "Bulk Enrollment Complete",
        description: messages.join(", "),
        variant: results.errors > 0 ? "destructive" : "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete bulk enrollment",
        variant: "destructive",
      });
    },
  });

  const updateEnrollment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Enrollment> & { id: string }) => {
      const { data, error } = await supabase
        .from("enrollments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast({
        title: "Enrollment Updated",
        description: "Enrollment has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update enrollment",
        variant: "destructive",
      });
    },
  });

  const deleteEnrollment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("enrollments")
        .update({ status: "dropped" })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast({
        title: "Enrollment Dropped",
        description: "Student has been unenrolled successfully",
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to drop enrollment",
        variant: "destructive",
      });
    },
  });

  return {
    enrollments,
    isLoading,
    createEnrollment,
    bulkCreateEnrollment,
    updateEnrollment,
    deleteEnrollment,
  };
};
