import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const usePlacementSchedule = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('placement-schedule-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'placement_schedule'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["placement-schedule"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["placement-schedule"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("placement_schedule")
        .select(`
          *,
          companies:placement_companies(company_name)
        `)
        .order("drive_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};
