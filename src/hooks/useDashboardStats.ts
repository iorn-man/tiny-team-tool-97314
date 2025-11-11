import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  averageAttendance: number;
  pendingFeedback: number;
  recentAnnouncements: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [
        studentsResult,
        facultyResult,
        coursesResult,
        enrollmentsResult,
        activeEnrollmentsResult,
        attendanceResult,
        feedbackResult,
        announcementsResult,
      ] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("faculties").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "enrolled"),
        supabase.from("attendance").select("status"),
        supabase.from("feedback").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("announcements").select("id", { count: "exact", head: true }).eq("published", true).gte("expires_at", new Date().toISOString()),
      ]);

      // Calculate average attendance
      const attendanceData = attendanceResult.data || [];
      const presentCount = attendanceData.filter((a) => a.status === "present").length;
      const averageAttendance = attendanceData.length > 0 
        ? (presentCount / attendanceData.length) * 100 
        : 0;

      return {
        totalStudents: studentsResult.count || 0,
        totalFaculty: facultyResult.count || 0,
        totalCourses: coursesResult.count || 0,
        totalEnrollments: enrollmentsResult.count || 0,
        activeEnrollments: activeEnrollmentsResult.count || 0,
        averageAttendance: Math.round(averageAttendance),
        pendingFeedback: feedbackResult.count || 0,
        recentAnnouncements: announcementsResult.count || 0,
      } as DashboardStats;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
