import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePlacementStats = () => {
  return useQuery({
    queryKey: ["placement-stats"],
    queryFn: async () => {
      const [companiesResult, schedulesResult, placementsResult] = await Promise.all([
        supabase.from("placement_companies").select("id", { count: "exact" }),
        supabase
          .from("placement_schedule")
          .select("id", { count: "exact" })
          .in("status", ["scheduled", "ongoing"]),
        supabase.from("student_placements").select("id", { count: "exact" }),
      ]);

      const [studentsResult] = await Promise.all([
        supabase.from("students").select("id", { count: "exact" }).eq("status", "active"),
      ]);

      const totalCompanies = companiesResult.count || 0;
      const scheduledDrives = schedulesResult.count || 0;
      const placedStudents = placementsResult.count || 0;
      const totalStudents = studentsResult.count || 1;
      const placementRate = Math.round((placedStudents / totalStudents) * 100);

      return {
        totalCompanies,
        scheduledDrives,
        placedStudents,
        placementRate: `${placementRate}%`,
      };
    },
  });
};
