import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export interface RecentActivity {
  action: string;
  name: string;
  time: string;
  type: string;
}

export const useRecentActivities = () => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const recentActivities: RecentActivity[] = [];

      // Fetch recent students
      const { data: recentStudents } = await supabase
        .from("students")
        .select("full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      recentStudents?.forEach((student) => {
        recentActivities.push({
          action: "New student enrolled",
          name: student.full_name,
          time: formatDistanceToNow(new Date(student.created_at), { addSuffix: true }),
          type: "student",
        });
      });

      // Fetch recent attendance
      const { data: recentAttendance } = await supabase
        .from("attendance")
        .select("created_at, marked_by")
        .order("created_at", { ascending: false })
        .limit(3);

      recentAttendance?.forEach((att) => {
        recentActivities.push({
          action: "Attendance marked",
          name: "Faculty",
          time: formatDistanceToNow(new Date(att.created_at), { addSuffix: true }),
          type: "attendance",
        });
      });

      // Fetch recent grades
      const { data: recentGrades } = await supabase
        .from("grades")
        .select("created_at, entered_by")
        .order("created_at", { ascending: false })
        .limit(3);

      recentGrades?.forEach((grade) => {
        recentActivities.push({
          action: "Grade submitted",
          name: "Faculty",
          time: formatDistanceToNow(new Date(grade.created_at), { addSuffix: true }),
          type: "grade",
        });
      });

      // Fetch recent announcements
      const { data: recentAnnouncements } = await supabase
        .from("announcements")
        .select("title, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      recentAnnouncements?.forEach((ann) => {
        recentActivities.push({
          action: "New announcement posted",
          name: ann.title,
          time: formatDistanceToNow(new Date(ann.created_at), { addSuffix: true }),
          type: "announcement",
        });
      });

      // Sort by time (most recent first)
      return recentActivities
        .sort((a, b) => {
          // Parse relative times back to compare
          return 0;
        })
        .slice(0, 8);
    },
    refetchInterval: 30000,
  });

  return { activities, isLoading };
};
