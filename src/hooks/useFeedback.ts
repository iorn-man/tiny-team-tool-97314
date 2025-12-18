import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Feedback {
  id: string;
  student_id: string;
  category: string;
  subject: string;
  description: string;
  status: "pending" | "in_progress" | "under_review" | "resolved" | "rejected" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  admin_response?: string;
  responded_by?: string;
  responded_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const useFeedback = (studentId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ["feedback", studentId],
    queryFn: async () => {
      let query = supabase.from("feedback").select("*");
      
      if (studentId) query = query.eq("student_id", studentId);
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Feedback[];
    },
  });

  const createFeedback = useMutation({
    mutationFn: async (newFeedback: Omit<Feedback, "id" | "created_at" | "updated_at" | "admin_response" | "responded_by" | "responded_at">) => {
      const { data, error } = await supabase
        .from("feedback")
        .insert([newFeedback])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      toast({
        title: "Feedback Submitted",
        description: "Your feedback has been submitted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    },
  });

  const updateFeedback = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Feedback> & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (updates.admin_response) {
        updates.responded_by = user?.id;
        updates.responded_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from("feedback")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      toast({
        title: "Feedback Updated",
        description: "Feedback has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update feedback",
        variant: "destructive",
      });
    },
  });

  return {
    feedbacks,
    isLoading,
    createFeedback,
    updateFeedback,
  };
};
