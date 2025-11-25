import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePlacementSchedule = () => {
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
