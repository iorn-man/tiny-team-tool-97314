import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePlacementCompanies = () => {
  return useQuery({
    queryKey: ["placement-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("placement_companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
