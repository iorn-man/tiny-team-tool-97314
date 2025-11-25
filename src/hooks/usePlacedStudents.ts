import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePlacedStudents = () => {
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
