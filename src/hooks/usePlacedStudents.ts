import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const usePlacedStudents = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('student-placements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_placements'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["placed-students"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["placed-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_placements")
        .select(`
          *,
          students(full_name, student_id),
          companies:placement_companies(company_name)
        `)
        .order("placement_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
