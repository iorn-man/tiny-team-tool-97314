import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Attendance {
  id: string;
  student_id: string;
  course_id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
  marked_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const useAttendance = (courseId?: string, date?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ["attendance", courseId, date],
    queryFn: async () => {
      let query = supabase.from("attendance").select("*");
      
      if (courseId) query = query.eq("course_id", courseId);
      if (date) query = query.eq("date", date);
      
      const { data, error } = await query.order("date", { ascending: false });
      
      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!courseId || !!date,
  });

  const markAttendance = useMutation({
    mutationFn: async (records: Omit<Attendance, "id" | "created_at" | "updated_at">[]) => {
      const { data, error } = await supabase
        .from("attendance")
        .upsert(records, { onConflict: "student_id,course_id,date" })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({
        title: "Attendance Marked",
        description: "Attendance has been recorded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark attendance",
        variant: "destructive",
      });
    },
  });

  const updateAttendance = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Attendance> & { id: string }) => {
      const { data, error } = await supabase
        .from("attendance")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({
        title: "Attendance Updated",
        description: "Attendance record has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update attendance",
        variant: "destructive",
      });
    },
  });

  return {
    attendance,
    isLoading,
    markAttendance,
    updateAttendance,
  };
};
